import type { Wallet, WalletInfo } from '@subwallet/wallet-connect/types';

import FearlessWalletLogo from '../assets/img/FearlessWalletLogo.svg';

import { AppWallet } from './index';

export const FearlessWalletInfo: WalletInfo = {
  extensionName: AppWallet.FearlessWallet,
  title: 'Fearless Wallet',
  installUrl: 'https://chrome.google.com/webstore/detail/fearless-wallet/nhlnehondigmgckngjomcpcefcdplmgc',
  logo: {
    src: FearlessWalletLogo as string,
    alt: 'Fearless Wallet Extension',
  },
};

export const InternalWallets = [AppWallet.GoogleDrive];

export const isInternalSource = (source?: AppWallet) => !source || InternalWallets.includes(source);
export const isInternalWallet = (wallet: Wallet) => isInternalSource(wallet.extensionName as AppWallet);
