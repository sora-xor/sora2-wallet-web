import { AppWallet } from '../../consts';
import { AppError, waitForDocumentReady } from '../../util';

import {
  KnownWallets,
  PredefinedWallets,
  AppStorageWallets,
  DesktopWallets,
  InternalWallets,
  ExtensionWallets,
} from './consts';
import { BaseDotSamaWallet } from './wallet';

import type { WalletInfo, Wallet } from './types';
import type { InjectedWindow, InjectedWindowProvider } from '@polkadot/extension-inject/types';

declare global {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  interface Window extends InjectedWindow {}
}

const walletList: BaseDotSamaWallet[] = [];

export function addWallet(data: WalletInfo, dAppName: string): void {
  const wallet = new BaseDotSamaWallet(data, dAppName);
  walletList.push(wallet);
}

export function checkWallet(extensionName: string): Wallet {
  const wallet = getWalletBySource(extensionName);

  if (!wallet) {
    // we haven't wallet data, so extension key used in translation
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension: extensionName } });
  }

  return wallet;
}

export function getWallets(): BaseDotSamaWallet[] {
  return walletList;
}

export function getWalletBySource(source: string): BaseDotSamaWallet | undefined {
  return getWallets().find((wallet) => {
    return wallet.extensionName === source;
  });
}

export function getWalletInfo(extensionName: string): WalletInfo {
  if (extensionName in KnownWallets) return KnownWallets[extensionName];

  const title = extensionName
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  return {
    extensionName,
    title,
    chromeUrl: '',
    mozillaUrl: '',
    logo: {
      src: '',
      alt: extensionName,
    },
  };
}

const initializeWalletsByKeys = (extensionNames: string[], dAppName: string): void => {
  extensionNames.forEach((extensionName) => {
    try {
      checkWallet(extensionName);
    } catch {
      addWallet(getWalletInfo(extensionName), dAppName);
    }
  });
};

export const initializeWallets = (dAppName: string): void => {
  const extensionNames = [...PredefinedWallets, ...Object.keys(window.injectedWeb3)];

  initializeWalletsByKeys(extensionNames, dAppName);
};

export const addWalletLocally = (
  wallet: InjectedWindowProvider,
  walletKey: string,
  dAppName: string,
  walletNameOverride?: string
): void => {
  const walletInfo = getWalletInfo(walletKey);
  const extensionName = walletNameOverride ?? walletInfo.extensionName;

  window.injectedWeb3 = window.injectedWeb3 || {};
  window.injectedWeb3[extensionName] = wallet;

  if (!getWalletBySource(extensionName)) {
    addWallet({ ...walletInfo, extensionName }, dAppName);
    console.info(`[${dAppName}] Wallet added: "${extensionName}"`);
  }
};

const isWalletsSource = (source: AppWallet, wallets: AppWallet[]) =>
  !!wallets.find((walletName) => source.startsWith(walletName));

export const isAppStorageSource = (source: AppWallet) => isWalletsSource(source, AppStorageWallets);

export const isDesktopSource = (source: AppWallet) => isWalletsSource(source, DesktopWallets);

export const isDesktopWallet = (wallet: Wallet) => isDesktopSource(wallet.extensionName as AppWallet);

export const isInternalSource = (source: AppWallet) => isWalletsSource(source, InternalWallets);

export const isInternalWallet = (wallet: Wallet) => isInternalSource(wallet.extensionName as AppWallet);

export const isExtensionSource = (source: AppWallet) => isWalletsSource(source, ExtensionWallets);

export const getAppWallets = (isDesktop = false): Wallet[] => {
  try {
    const wallets = getWallets();
    const filtered = isDesktop ? wallets.filter((wallet) => isDesktopWallet(wallet)) : wallets;
    const sorted = [...filtered].sort((a, b) => {
      const aName = a.extensionName;
      const bName = b.extensionName;

      if (aName === AppWallet.FearlessWallet) {
        return -1;
      }
      if (bName === AppWallet.FearlessWallet) {
        return 1;
      }

      return aName.localeCompare(bName);
    });

    return sorted;
  } catch (error) {
    throw new AppError({ key: 'polkadotjs.noExtensions' });
  }
};

export const getWallet = async (extension = AppWallet.PolkadotJS, autoreload = false): Promise<Wallet> => {
  const wallet = checkWallet(extension);

  if (!wallet.installed) {
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension: wallet.title } });
  }

  await waitForDocumentReady();

  await wallet.enable();

  const hasExtension = !!wallet.extension;
  const hasSigner = typeof wallet.signer === 'object';

  if (hasExtension && hasSigner) return wallet;

  if (autoreload) {
    window.location.reload();
  } else {
    const key = hasExtension && !isInternalWallet(wallet) ? 'polkadotjs.noSigner' : 'polkadotjs.connectionError';
    throw new AppError({ key, payload: { extension: wallet.title } });
  }

  return wallet;
};
