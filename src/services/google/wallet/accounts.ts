import { api } from '../../../api';
import { BackupAccountCrypto } from '../backup/account';
import { generateSeed } from '../backup/crypto';
import { BackupAccountType } from '../backup/types';
import { GDriveStorage } from '../index';

import type { EncryptedBackupAccount, DecryptedBackupAccount } from '../backup/types';
import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

interface IAccountMetadata extends InjectedAccount {
  id: string;
}

const ACCOUNTS_UPDATE_INTERVAL = 60_000;

const prepareAccountFile = (account: EncryptedBackupAccount | DecryptedBackupAccount) => {
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
    // password check
    const pair = api.createAccountPairFromJson(accountPairJson);
    const substrateJson = api.exportAccount(pair, password);
    // existance check
    if (this.findAccountByAddress(accountPairJson.address)) return;

    const { address, meta } = accountPairJson;

    const decryptedAccount: DecryptedBackupAccount = {
      name: (meta?.name as string) || '',
      address: api.formatAddress(address),
      cryptoType: 'sr25519'.toUpperCase(),
      backupAccountType: [BackupAccountType.JSON],
      mnemonicPhrase: passphrase,
      substrateDerivationPath: null,
      ethDerivationPath: null,
      seed: null,
      json: {
        substrateJson,
      },
    };

    if (passphrase) {
      decryptedAccount.seed = { substrateSeed: generateSeed(passphrase) };
      decryptedAccount.backupAccountType.push(BackupAccountType.PASSHRASE, BackupAccountType.SEED);
    }

    const encryptedAccount = BackupAccountCrypto.encryptAccount(decryptedAccount, password);
    const fileData = prepareAccountFile(encryptedAccount);

    await GDriveStorage.create(fileData);
    await this.get();
  }

  public async changeName(address: string, name: string) {
    const id = await this.getAccountIdByAddress(address);
    const encryptedAccount = (await GDriveStorage.get(id)) as EncryptedBackupAccount;
    // update name in root
    encryptedAccount.name = name;
    // update name in substrateJson
    if (encryptedAccount.json?.substrateJson) {
      const substrateJson = JSON.parse(encryptedAccount.json.substrateJson);
      substrateJson.meta = substrateJson.meta || {};
      substrateJson.meta.name = name;
      encryptedAccount.json.substrateJson = JSON.stringify(substrateJson);
    }

    const fileData = prepareAccountFile(encryptedAccount);

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
    const decryptedAccount = BackupAccountCrypto.decryptAccount(encryptedAccount, password);

    if (decryptedAccount.json?.substrateJson) {
      return JSON.parse(decryptedAccount.json.substrateJson) as KeyringPair$Json;
    }

    const suri = decryptedAccount.mnemonicPhrase || decryptedAccount.seed?.substrateSeed;

    if (suri) {
      const pair = api.createAccountPair(suri, decryptedAccount.name);

      return pair.toJson(password);
    }

    return null;
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
