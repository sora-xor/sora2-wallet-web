import type { InjectedAccount, InjectedAccounts, Unsubcall } from '@polkadot/extension-inject/types';

import { googleManage } from '../index';

export default class Accounts implements InjectedAccounts {
  public async get(): Promise<InjectedAccount[]> {
    const { result } = await googleManage.api.getFiles();

    return result.files as unknown as InjectedAccount[];
  }

  public subscribe(accountsCallback: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    const getAccounts = async () => {
      const accounts = await this.get();
      accountsCallback(accounts);
    };

    getAccounts();

    const id = setInterval(getAccounts, 60000);

    return () => {
      clearInterval(id);
    };
  }
}
