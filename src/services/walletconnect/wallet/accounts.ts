import { formatAccountAddress } from '../../../util';

import type { WcSubstrateProvider } from '../provider';
import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';

const ACCOUNTS_UPDATE_INTERVAL = 60_000;

export default class Accounts implements InjectedAccounts {
  private wcProvider!: WcSubstrateProvider;

  private _list: InjectedAccount[] = [];
  private accountsCallback: Nullable<(accounts: InjectedAccount[]) => unknown> = null;
  private accountsUpdateInterval: Nullable<NodeJS.Timeout> = null;

  constructor(wcProvider: WcSubstrateProvider) {
    this.wcProvider = wcProvider;
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
    const accountAddresses = this.wcProvider.getAccounts();

    this.accountsList = accountAddresses.map((address) => ({
      address: formatAccountAddress(address, false),
    }));

    return this.accountsList;
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
