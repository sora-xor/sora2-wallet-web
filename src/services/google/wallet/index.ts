import { addWallet, getWalletBySource } from '@subwallet/wallet-connect/dotsama/wallets';
import type { WalletInfo } from '@subwallet/wallet-connect/types';

import GoogleLogo from '../../../assets/img/GoogleLogo.svg';

import { AppWallet } from '../../../consts';

import { googleStorage } from '../index';

import Accounts from './accounts';

const GDriveWalletInfo: WalletInfo = {
  extensionName: AppWallet.GoogleDrive,
  title: 'Google',
  installUrl: '',
  logo: {
    src: GoogleLogo as string,
    alt: 'Google',
  },
};

class GoogleDriveWallet {
  public readonly version = '0.0.1';
  public readonly name: AppWallet = AppWallet.GoogleDrive;

  private access!: boolean;
  public readonly accounts!: Accounts;

  constructor() {
    this.accounts = new Accounts();
    this.access = false;
  }

  async enable() {
    try {
      await googleStorage.auth();
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
    addWallet(GDriveWalletInfo);
  }
};
