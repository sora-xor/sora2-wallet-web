import type { Wallet, WalletInfo } from '@sora-test/wallet-connect/types';

import GoogleLogo from '../assets/img/GoogleLogo.svg';

import { AppWallet } from './index';

export const GDriveWalletInfo: WalletInfo = {
  extensionName: AppWallet.GoogleDrive,
  title: 'Google',
  chromeUrl: '',
  mozillaUrl: '',
  logo: {
    src: GoogleLogo as string,
    alt: 'Google',
  },
};

export const InternalWallets = [AppWallet.GoogleDrive];

export const isInternalSource = (source?: AppWallet) => !source || InternalWallets.includes(source);
export const isInternalWallet = (wallet: Wallet) => isInternalSource(wallet.extensionName as AppWallet);
