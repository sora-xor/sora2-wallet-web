import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringPair$Json } from '@polkadot/keyring/types';

import { googleStorage } from '../index';

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

  public async add(accountJson: KeyringPair$Json): Promise<void> {
    const { address, meta } = accountJson;
    const json = JSON.stringify(accountJson);
    const name = (meta.name as string) || '';

    await googleStorage.create(json, address, name);
    await this.updateAccounts();
  }

  public async get(): Promise<InjectedAccount[]> {
    const files = await googleStorage.getAll();

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
    const account = this.accountsList.find((acc) => acc.address === address);

    if (!account) return null;

    const id = account.id;
    const json = await googleStorage.get(id);

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
