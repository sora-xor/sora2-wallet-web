import { GDriveWalletInfo } from '../../../consts/wallets';
import { Singleton } from '../../../decorators';
import { addWalletLocally } from '../../../util/account';
import { GDriveStorage } from '../index';

import Accounts from './accounts';

import type { InjectedWindowProvider, Injected } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';

@Singleton
class GoogleDriveWallet implements InjectedWindowProvider {
  public static readonly version = '0.0.1';

  private access = false;
  public readonly accounts!: Accounts;

  constructor() {
    this.accounts = new Accounts();
  }

  private get signer(): Signer {
    return (this.access ? null : undefined) as unknown as Signer;
  }

  async enable(): Promise<Injected> {
    try {
      await GDriveStorage.auth();
      this.access = true;
    } catch {
      this.access = false;
    }

    return {
      accounts: this.accounts,
      metadata: undefined,
      provider: undefined,
      signer: this.signer,
    };
  }
}

export const GDriveWallet = new GoogleDriveWallet();

export const addGDriveWalletLocally = () => {
  if (!GDriveStorage.hasKey) return;

  addWalletLocally(GDriveWallet, GDriveWalletInfo);
};
