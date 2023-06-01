import { addWallet, getWalletBySource } from '@sora-test/wallet-connect/dotsama/wallets';
import { Singleton } from '../../../decorators';

import { GDriveWalletInfo } from '../../../consts/wallets';
import { GDriveStorage } from '../index';

import Accounts from './accounts';
import { TranslationConsts } from '@/consts';

@Singleton
class GoogleDriveWallet {
  public readonly version = '0.0.1';
  public readonly name = GDriveWalletInfo.extensionName;

  private access!: boolean;
  public readonly accounts!: Accounts;

  constructor() {
    this.accounts = new Accounts();
    this.access = false;
  }

  async enable() {
    try {
      await GDriveStorage.auth();
      this.access = true;
    } catch {
      this.access = false;
    }

    return {
      version: this.version,
      name: this.name,
      accounts: this.accounts,
      provider: undefined,
      signer: this.access ? null : undefined,
      metadata: undefined,
    };
  }
}

export const GDriveWallet = new GoogleDriveWallet();

const injectGDriveWallet = () => {
  const injectedWindow = window as any;

  injectedWindow.injectedWeb3 = injectedWindow.injectedWeb3 || {};
  injectedWindow.injectedWeb3[GDriveWallet.name] = GDriveWallet;
};

export const addGDriveWalletLocally = () => {
  injectGDriveWallet();

  if (!getWalletBySource(GDriveWalletInfo.extensionName)) {
    addWallet(GDriveWalletInfo, TranslationConsts.Polkaswap);
  }
};
