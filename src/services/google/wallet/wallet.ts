import { addWallet } from '@subwallet/wallet-connect/dotsama/wallets';
import type { WalletInfo } from '@subwallet/wallet-connect/types';

import GoogleLogo from '../../../assets/img/GoogleLogo.svg';

import { AppWallet } from '../../../consts';

import { googleManage } from '../index';

import Accounts from './accounts';

const GoogleDriveWalletInfo: WalletInfo = {
  extensionName: AppWallet.GoogleDrive,
  title: 'Google',
  installUrl: '',
  logo: {
    src: GoogleLogo as string,
    alt: 'Google auth',
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
    await googleManage.auth();

    this.access = true;

    return {
      version: '0.0.1',
      name: this.name,
      accounts: this.accounts,
      provider: undefined,
      signer: this.access ? null : undefined,
      metadata: undefined,
    };
  }
}

export const GDriveWallet = new GoogleDriveWallet();

const injectGoogleDriveWallet = () => {
  const injectedWindow = window as any;

  injectedWindow.injectedWeb3 = injectedWindow.injectedWeb3 || {};
  injectedWindow.injectedWeb3[GoogleDriveWalletInfo.extensionName] = GDriveWallet;
};

export const addGoogleDriveWalletLocally = () => {
  injectGoogleDriveWallet();
  addWallet(GoogleDriveWalletInfo);
};
