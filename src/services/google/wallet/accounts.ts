import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { GDriveStorage } from '../index';
import { api } from '../../../api';

interface IAccountMetadata extends InjectedAccount {
  id: string;
}

export default class Accounts implements InjectedAccounts {
  private accountsList: IAccountMetadata[] = [];
  private accountsCallback: Nullable<(accounts: InjectedAccount[]) => unknown> = null;
  private accountsUpdateInterval: Nullable<NodeJS.Timer> = null;

  private async updateAccounts(): Promise<void> {
    await this.get();
    if (typeof this.accountsCallback === 'function') {
      this.accountsCallback(this.accountsList);
    }
  }

  private getAccountByAddress(address: string): Nullable<IAccountMetadata> {
    const defaultAddress = api.formatAddress(address, false);
    return this.accountsList.find((acc) => acc.address === defaultAddress);
  }

  private async getAccountId(address: string): Promise<string> {
    await this.get();

    const account = this.getAccountByAddress(address);

    if (!account) throw new Error(`Account not found: ${address}`);

    return account.id;
  }

  public async add(accountJson: KeyringPair$Json): Promise<void> {
    const { address, meta } = accountJson;

    if (this.getAccountByAddress(address)) return;

    const json = JSON.stringify(accountJson);
    const name = (meta.name as string) || '';

    await GDriveStorage.create(json, address, name);
    await this.updateAccounts();
  }

  public async changeName(address: string, name: string) {
    const id = await this.getAccountId(address);

    await GDriveStorage.update(id, name);
    await this.updateAccounts();
  }

  public async delete(address: string): Promise<void> {
    const id = await this.getAccountId(address);

    await GDriveStorage.delete(id);
    await this.updateAccounts();
  }

  public async get(): Promise<InjectedAccount[]> {
    const files = await GDriveStorage.getAll();

    this.accountsList = files
      ? files.map((file) => ({
          address: file.description || '',
          name: file.name || '',
          id: file.id as string,
        }))
      : [];

    return this.accountsList;
  }

  public async getAccount(address: string): Promise<Nullable<KeyringPair$Json>> {
    const id = await this.getAccountId(address);
    const json = await GDriveStorage.get(id);

    return json as KeyringPair$Json;
  }

  public subscribe(accountsCallback: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    this.accountsCallback = accountsCallback;
    this.updateAccounts();
    this.accountsUpdateInterval = setInterval(this.updateAccounts.bind(this), 15000);

    return this.unsubscribe.bind(this);
  }

  public unsubscribe(): void {
    if (this.accountsUpdateInterval) {
      clearInterval(this.accountsUpdateInterval);
    }
    this.accountsCallback = null;
  }
}
