import { getWallets, getWalletBySource, initialize } from '@sora-test/wallet-connect/dotsama/wallets';
import { saveAs } from 'file-saver';

import { api } from '../api';
import { AppWallet, TranslationConsts } from '../consts';
import { isInternalWallet } from '../consts/wallets';
import { AppError, waitForDocumentReady } from '../util';

import type { KeyringPair$Json, PolkadotJsAccount } from '../types/common';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';
import type { ApiAccount } from '@sora-substrate/util';
import type { Wallet, WalletAccount } from '@sora-test/wallet-connect/types';

export const lockAccountPair = (api: ApiAccount): void => {
  api.lockPair();
};

export const unlockAccountPair = (api: ApiAccount, password: string): void => {
  api.unlockPair(password);
};

export const logoutApi = (api: ApiAccount, forget = false): void => {
  if (forget) {
    api.forgetAccount();
  }

  api.logout();
};

export const initAppWallets = (appName?: string) => initialize(appName ?? TranslationConsts.Polkaswap);

export const getAppWallets = (): Wallet[] => {
  try {
    const wallets = getWallets().sort((a, b) => {
      if (a.extensionName === AppWallet.FearlessWallet) {
        return -1;
      }
      if (b.extensionName === AppWallet.FearlessWallet) {
        return 1;
      }
      return 0;
    });

    return wallets;
  } catch (error) {
    throw new AppError({ key: 'polkadotjs.noExtensions' });
  }
};

export const checkWallet = (extension: AppWallet): Wallet => {
  const wallet = getWalletBySource(extension);

  if (!wallet) {
    // we haven't wallet data, so extension key used in translation
    throw new AppError({ key: 'polkadotjs.noExtension', payload: { extension } });
  }

  return wallet;
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

/**
 * Retrieves a provider for a specific wallet
 * @param appWallet
 * @returns
 */
export const getWalletSigner = async (appWallet: AppWallet, autoreload = false) => {
  const wallet = await getWallet(appWallet, autoreload);

  return wallet.signer as Signer;
};

export const updateApiSigner = async (api: ApiAccount, source: AppWallet): Promise<void> => {
  const signer = await getWalletSigner(source, true);

  api.setSigner(signer);
};

export const getImportedAccounts = (api: ApiAccount): PolkadotJsAccount[] => {
  const accounts = api.getAccounts();
  const polkadotJsAccounts = accounts.map((account) => ({
    address: account.address,
    name: account.meta.name || '',
  }));
  return polkadotJsAccounts;
};

const formatWalletAccount = (account: WalletAccount): PolkadotJsAccount => ({
  address: account.address,
  name: account.name || '',
  source: account.source as AppWallet,
});

const formatWalletAccounts = (accounts: Nullable<WalletAccount[]>): PolkadotJsAccount[] => {
  return (accounts || []).map((account) => formatWalletAccount(account));
};

const subscribeToInternalAccounts = (api: ApiAccount, callback: (accounts: PolkadotJsAccount[]) => void) => {
  callback(getImportedAccounts(api));

  const subscription = setInterval(() => {
    callback(getImportedAccounts(api));
  }, 5_000);

  return () => clearInterval(subscription);
};

const subscribeToExternalAccounts = async (wallet: AppWallet, callback: (accounts: PolkadotJsAccount[]) => void) => {
  const appWallet = await getWallet(wallet);
  const accounts = await appWallet.getAccounts();

  callback(formatWalletAccounts(accounts));

  const unsubscribe = await appWallet.subscribeAccounts((injectedAccounts) => {
    callback(formatWalletAccounts(injectedAccounts));
  });

  // [TODO]: Wait for Polkadot.js extension release, because unsubscribe not works now
  return unsubscribe;
};

export const subscribeToWalletAccounts = async (
  api: ApiAccount,
  wallet: AppWallet,
  callback: (accounts: PolkadotJsAccount[]) => void
): Promise<Nullable<Unsubcall>> => {
  return wallet ? await subscribeToExternalAccounts(wallet, callback) : subscribeToInternalAccounts(api, callback);
};

export const parseAccountJson = (file: File): Promise<KeyringPair$Json> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const json = reader.result as string;
      resolve(JSON.parse(json));
    };
    reader.onerror = (e) => reject(e);
  });
};

export const exportAccountJson = (pairJson: KeyringPair$Json): void => {
  const accountJson = JSON.stringify(pairJson);
  const blob = new Blob([accountJson], { type: 'application/json' });
  const filename = pairJson.address || '';
  saveAs(blob, filename);
};

export const verifyAccountJson = (pairJson: KeyringPair$Json, password: string): KeyringPair$Json => {
  const pair = api.createAccountPairFromJson(pairJson);
  const accountJson = pair.toJson(password);

  return accountJson;
};
