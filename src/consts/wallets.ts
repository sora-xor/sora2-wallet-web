import GoogleLogo from '../assets/img/GoogleLogo.svg';
import WalletConnectLogo from '../assets/img/WalletConnect.svg';

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

export const WalletConnectInfo: WalletInfo = {
  extensionName: AppWallet.WalletConnect,
  title: 'WalletConnect',
  chromeUrl: '',
  mozillaUrl: '',
  logo: {
    src: WalletConnectLogo as string,
    alt: 'WalletConnect',
  },
};

export const InternalWallets = [AppWallet.Sora, AppWallet.GoogleDrive];

export const DesktopWallets = [AppWallet.Sora, AppWallet.WalletConnect];
