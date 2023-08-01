import { u8aToHex } from '@polkadot/util';
import { mnemonicToMiniSecret } from '@polkadot/util-crypto';

import { api } from '../../../api';
import { AppError, formatAddress } from '../../../util';
import { BackupAccountCrypto } from '../backup/account';
import { BackupAccountType } from '../backup/types';
import { GDriveStorage } from '../index';

import type { EncryptedBackupAccount, DecryptedBackupAccount } from '../backup/types';
import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

interface IAccountMetadata extends InjectedAccount {
  id: string;
}

const ACCOUNTS_UPDATE_INTERVAL = 60_000;

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
    const soraAddress = api.formatAddress(address);

    return this.accountsList.find((acc) => acc.address === soraAddress);
  }

  private async getAccountIdByAddress(address: string): Promise<string> {
    await this.get();

    const account = this.findAccountByAddress(address);

    if (!account) throw new Error(`Account not found: ${address}`);

    return account.id;
  }

  public async add(accountPairJson: KeyringPair$Json, data?: { seed: string; password: string }): Promise<void> {
    const { address, meta } = accountPairJson;

    if (this.findAccountByAddress(address)) {
      const formattedSoraAddress = formatAddress(api.formatAddress(address));

      throw new AppError({
        key: 'desktop.errorMessages.alreadyImported',
        payload: {
          address: formattedSoraAddress,
        },
      });
    }

    const soraAddress = api.formatAddress(address);
    const accountName = (meta?.name as string) || '';
    const mnemonicPhrase = data?.seed;
    const password = data?.password;

    const account: DecryptedBackupAccount = {
      name: accountName,
      address: soraAddress,
      cryptoType: 'SR25519',
      backupAccountType: [BackupAccountType.JSON],
      mnemonicPhrase,
      substrateDerivationPath: null,
      ethDerivationPath: null,
      seed: null,
      json: {
        substrateJson: JSON.stringify(accountPairJson),
      },
    };

    if (mnemonicPhrase && password) {
      const substrateSeed = u8aToHex(mnemonicToMiniSecret(mnemonicPhrase));

      account.seed = { substrateSeed };
      account.backupAccountType.push(BackupAccountType.PASSHRASE, BackupAccountType.SEED);
    }

    const encryptedAccount = password ? BackupAccountCrypto.encryptAccount(account, password) : account;

    const fileData = {
      name: `${soraAddress}.json`,
      description: accountName,
      json: JSON.stringify(encryptedAccount),
    };

    await GDriveStorage.create(fileData);
    await this.get();
  }

  public async changeName(address: string, name: string) {
    const id = await this.getAccountIdByAddress(address);
    const file = (await GDriveStorage.get(id)) as EncryptedBackupAccount;
    // update name in root
    file.name = name;
    // update name in substrateJson
    if (file.json?.substrateJson) {
      const substrateJson = JSON.parse(file.json.substrateJson);
      substrateJson.meta = substrateJson.meta || {};
      substrateJson.meta.name = name;

      file.json.substrateJson = JSON.stringify(substrateJson);
    }

    const fileData = {
      name: api.formatAddress(address),
      description: name,
      json: JSON.stringify(file),
    };

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
      ? files.map((file) => ({
          name: file.description || '',
          address: (file.name || '').replace(/\.json$/, ''),
          id: file.id as string,
        }))
      : [];

    return this.accountsList;
  }

  public async getAccount(address: string, password: string): Promise<Nullable<KeyringPair$Json>> {
    const id = await this.getAccountIdByAddress(address);
    const file = (await GDriveStorage.get(id)) as EncryptedBackupAccount;
    const account = BackupAccountCrypto.decryptAccount(file, password);
    const suri = account.mnemonicPhrase || account.seed?.substrateSeed;

    if (suri) {
      const pair = api.createAccountPair(suri, account.name);

      return pair.toJson(password);
    }

    if (account.json?.substrateJson) {
      return JSON.parse(account.json.substrateJson) as KeyringPair$Json;
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
