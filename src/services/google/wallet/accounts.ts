import { api } from '../../../api';
import { BackupAccountMapper } from '../backup/mapper';
import { GDriveStorage } from '../index';

import type { EncryptedBackupAccount } from '../backup/types';
import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

interface IAccountMetadata extends InjectedAccount {
  id: string;
}

const ACCOUNTS_UPDATE_INTERVAL = 60_000;

const prepareAccountFile = (account: EncryptedBackupAccount) => {
  return {
    name: `${account.address}.json`,
    description: account.name,
    json: JSON.stringify(account),
  };
};

export default class Accounts implements InjectedAccounts {
  private _list: IAccountMetadata[] = [];
  private accountsCallback: Nullable<(accounts: InjectedAccount[]) => unknown> = null;
  private accountsUpdateInterval: Nullable<NodeJS.Timer> = null;

  private get accountsList(): IAccountMetadata[] {
    return this._list;
  }

  private set accountsList(accounts: IAccountMetadata[]) {
    this._list = accounts;

    if (typeof this.accountsCallback === 'function') {
      this.accountsCallback(this._list);
    }
  }

  private findAccountByAddress(address: string): Nullable<IAccountMetadata> {
    const defaultAddress = api.formatAddress(address, false);

    return this.accountsList.find((acc) => acc.address === defaultAddress);
  }

  private async getAccountIdByAddress(address: string): Promise<string> {
    await this.get();

    const account = this.findAccountByAddress(address);

    if (!account) throw new Error(`Account not found: ${address}`);

    return account.id;
  }

  public async add(accountPairJson: KeyringPair$Json, password: string, passphrase?: string): Promise<void> {
    if (this.findAccountByAddress(accountPairJson.address)) return;

    const encryptedAccount = BackupAccountMapper.createFromPairJson(accountPairJson, password, passphrase);
    const fileData = prepareAccountFile(encryptedAccount);

    await GDriveStorage.create(fileData);
    await this.get();
  }

  public async changeName(address: string, name: string) {
    const id = await this.getAccountIdByAddress(address);
    const encryptedAccount = (await GDriveStorage.get(id)) as EncryptedBackupAccount;
    const updated = BackupAccountMapper.changeName(encryptedAccount, name);
    const fileData = prepareAccountFile(updated);

    await GDriveStorage.update(id, fileData);
    // if account name updated in storage, we don't need to do request, just update it locally
    this.accountsList = this.accountsList.map((account) => ({
      ...account,
      name: account.id === id ? name : account.name,
    }));
  }

  public async delete(address: string): Promise<void> {
    const id = await this.getAccountIdByAddress(address);

    await GDriveStorage.delete(id);
    // if account deleted in storage, we don't need to do request, just remove it locally
    this.accountsList = this.accountsList.filter((account) => account.id !== id);
  }

  public async get(): Promise<InjectedAccount[]> {
    const files = await GDriveStorage.getAll();

    this.accountsList = files
      ? files.map(({ id, name = '', description = '' }) => ({
          address: api.formatAddress(name.replace(/\.json$/, ''), false), // formatted account address (extension like)
          name: description, // account name
          id: id as string,
        }))
      : [];

    return this.accountsList;
  }

  public async getAccount(address: string, password: string): Promise<Nullable<KeyringPair$Json>> {
    const id = await this.getAccountIdByAddress(address);
    const encryptedAccount = (await GDriveStorage.get(id)) as EncryptedBackupAccount;
    const json = BackupAccountMapper.getPairJson(encryptedAccount, password);

    return json;
  }

  public subscribe(accountsCallback: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    this.accountsCallback = accountsCallback;

    this.accountsUpdateInterval = setInterval(this.get.bind(this), ACCOUNTS_UPDATE_INTERVAL);

    return this.unsubscribe.bind(this);
  }

  public unsubscribe(): void {
    if (this.accountsUpdateInterval) {
      clearInterval(this.accountsUpdateInterval);
    }
    this.accountsCallback = null;
  }
}
