import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { GDriveStorage } from '../index';
import { api } from '../../../api';

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
    const defaultAddress = api.formatAddress(address, false);
    return this.accountsList.find((acc) => acc.address === defaultAddress);
  }

  private async findAccountById(address: string): Promise<string> {
    await this.get();

    const account = this.findAccountByAddress(address);

    if (!account) throw new Error(`Account not found: ${address}`);

    return account.id;
  }

  public async add(accountJson: KeyringPair$Json): Promise<void> {
    const { address, meta } = accountJson;

    if (this.findAccountByAddress(address)) return;

    const json = JSON.stringify(accountJson);
    const name = (meta.name as string) || '';

    await GDriveStorage.create({ json, address, name });
    await this.get();
  }

  public async changeName(address: string, name: string) {
    const id = await this.findAccountById(address);
    const accountJson = (await GDriveStorage.get(id)) as KeyringPair$Json;

    accountJson.meta = accountJson.meta || {};
    accountJson.meta.name = name;

    const json = JSON.stringify(accountJson);

    await GDriveStorage.create({ json, address: accountJson.address, name }, id);
    // if account name updated in storage, we don't need to do request, just update it locally
    this.accountsList = this.accountsList.map((account) => ({
      ...account,
      name: account.id === id ? name : account.name,
    }));
  }

  public async delete(address: string): Promise<void> {
    const id = await this.findAccountById(address);

    await GDriveStorage.delete(id);
    // if account deleted in storage, we don't need to do request, just remove it locally
    this.accountsList = this.accountsList.filter((account) => account.id !== id);
  }

  public async get(): Promise<InjectedAccount[]> {
    const files = await GDriveStorage.getAll();

    this.accountsList = files
      ? files.map((file) => ({
          address: api.formatAddress(file.description || '', false),
          name: file.name || '',
          id: file.id as string,
        }))
      : [];

    return this.accountsList;
  }

  public async getAccount(address: string): Promise<KeyringPair$Json> {
    const id = await this.findAccountById(address);
    const json = await GDriveStorage.get(id);

    return json as KeyringPair$Json;
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
