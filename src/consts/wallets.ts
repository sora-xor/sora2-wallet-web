import GoogleLogo from '../assets/img/GoogleLogo.svg';
import SoraWalletLogo from '../assets/img/Sora.svg';
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

export const SoraWalletInfo: WalletInfo = {
  extensionName: AppWallet.Sora,
  title: 'Sora Wallet',
  chromeUrl: '',
  mozillaUrl: '',
  logo: {
    src: SoraWalletLogo as string,
    alt: 'Sora Wallet',
  },
};

/** Wallets with saved accounts in App */
export const AppStorageWallets = [AppWallet.Sora];
/** Wallets with App signature */
export const InternalWallets = [AppWallet.Sora, AppWallet.GoogleDrive];
/** Wallets for Desktop mode */
export const DesktopWallets = [AppWallet.Sora, AppWallet.WalletConnect];
