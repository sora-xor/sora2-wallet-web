import GoogleLogo from '../assets/img/GoogleLogo.svg';

import { AppWallet } from './index';

import type { WalletInfo } from '@sora-test/wallet-connect/types';

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
