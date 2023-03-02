import { addWallet } from '@subwallet/wallet-connect/dotsama/wallets';
import type { WalletInfo } from '@subwallet/wallet-connect/types';

import GoogleLogo from '../../../assets/img/GoogleLogo.svg';

import { AppWallet } from '../../../consts';

import { googleManage } from '../index';

import Accounts from './accounts';

const GoogleAuthWalletInfo: WalletInfo = {
  extensionName: AppWallet.GoogleAuth,
  title: 'Google',
  installUrl: '',
  logo: {
    src: GoogleLogo as string,
    alt: 'Google auth',
  },
};

class GoogleAuthWallet {
  public readonly version = '0.0.1';
  public readonly name = GoogleAuthWalletInfo.extensionName;

  private access!: boolean;
  private readonly accounts!: Accounts;

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
      signer: this.access,
      metadata: undefined,
    };
  }
}

export const addGoogleAuthWalletLocally = () => {
  const injectedWindow = window as any;

  injectedWindow.injectedWeb3 = injectedWindow.injectedWeb3 || {};
  injectedWindow.injectedWeb3[GoogleAuthWalletInfo.extensionName] = new GoogleAuthWallet();

  addWallet(GoogleAuthWalletInfo);
};
