import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { WithKeyring } from '@sora-substrate/util';

const formatAccounts = (accounts: KeyringAddress[]): InjectedAccount[] => {
  return accounts.map((account) => ({
    address: account.address,
    name: account.meta.name || '',
  }));
};

export default class Accounts implements InjectedAccounts {
  private api!: WithKeyring;

  private _list: InjectedAccount[] = [];
  private accountsCallback: Nullable<(accounts: InjectedAccount[]) => unknown> = null;

  constructor(api: WithKeyring) {
    this.api = api;
  }

  private get accountsList(): InjectedAccount[] {
    return this._list;
  }

  private set accountsList(accounts: InjectedAccount[]) {
    this._list = accounts;

    if (typeof this.accountsCallback === 'function') {
      this.accountsCallback(this._list);
    }
  }

  public async get(): Promise<InjectedAccount[]> {
    const accounts = this.api.getAccounts();

    this.accountsList = formatAccounts(accounts);

    return this.accountsList;
  }

  public subscribe(accountsCallback: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    const subscription = this.api.accountsObservable.subscribe((accounts) => {
      this.accountsList = formatAccounts(accounts);
      accountsCallback(this.accountsList);
    });

    return () => subscription.unsubscribe();
  }
}
