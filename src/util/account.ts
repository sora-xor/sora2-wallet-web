import { addWallet, getWallets, getWalletBySource, initialize } from '@sora-test/wallet-connect/dotsama/wallets';
import { saveAs } from 'file-saver';

import { AppWallet, TranslationConsts } from '../consts';
import { InternalWallets } from '../consts/wallets';
import { AppError, waitForDocumentReady } from '../util';

import type { KeyringPair$Json, PolkadotJsAccount } from '../types/common';
import type { Unsubcall, InjectedWindowProvider } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { WithKeyring } from '@sora-substrate/util';
import type { Wallet, WalletAccount, WalletInfo } from '@sora-test/wallet-connect/types';

export const lockAccountPair = (api: WithKeyring): void => {
  api.lockPair();
};

export const unlockAccountPair = (api: WithKeyring, password: string): void => {
  api.unlockPair(password);
};

export const loginApi = async (api: WithKeyring, accountData: PolkadotJsAccount, isDesktop = false) => {
  // Desktop has not source
  const source = (accountData.source as AppWallet) || '';
  const isExternal = !isInternalSource(source);
  const defaultAddress = api.formatAddress(accountData.address, false);
  const apiAddress = api.formatAddress(defaultAddress);
  const forget = !isDesktop && api.address !== apiAddress;

  logoutApi(api, forget);

  if (isExternal) {
    // we should update signer
    await updateApiSigner(api, source);
  }

  await api.loginAccount(defaultAddress, accountData.name, source, isExternal);
};

export const logoutApi = (api: WithKeyring, forget = false): void => {
  if (forget) {
    api.forgetAccount();
  }

  api.logout();
};

export const isInternalSource = (source?: AppWallet) =>
  !source || InternalWallets.some((walletName) => source.startsWith(walletName));

export const isInternalWallet = (wallet: Wallet) => isInternalSource(wallet.extensionName as AppWallet);

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

export const addWalletLocally = (
  wallet: InjectedWindowProvider,
  walletInfo: WalletInfo,
  nameOverride?: string
): void => {
  const extensionName = nameOverride ?? walletInfo.extensionName;

  const injectedWindow = window as any;

  injectedWindow.injectedWeb3 = injectedWindow.injectedWeb3 || {};
  injectedWindow.injectedWeb3[extensionName] = wallet;

  if (!getWalletBySource(extensionName)) {
    addWallet({ ...walletInfo, extensionName }, TranslationConsts.Polkaswap);
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

export const updateApiSigner = async (api: WithKeyring, source: AppWallet): Promise<void> => {
  const signer = await getWalletSigner(source, true);

  api.setSigner(signer);
};

const formatImportedAccounts = (accounts: KeyringAddress[]): PolkadotJsAccount[] => {
  return accounts.map((account) => ({
    address: account.address,
    name: account.meta.name || '',
  }));
};

export const getImportedAccounts = (api: WithKeyring): PolkadotJsAccount[] => {
  const accounts = api.getAccounts();
  return formatImportedAccounts(accounts);
};

const formatWalletAccount = (account: WalletAccount): PolkadotJsAccount => ({
  address: account.address,
  name: account.name || '',
  source: account.source as AppWallet,
});

const formatWalletAccounts = (accounts: Nullable<WalletAccount[]>): PolkadotJsAccount[] => {
  return (accounts || []).map((account) => formatWalletAccount(account));
};

const subscribeToInternalAccounts = (api: WithKeyring, callback: (accounts: PolkadotJsAccount[]) => void) => {
  callback(getImportedAccounts(api));

  const subscription = api.accountsObservable.subscribe((accounts) => {
    callback(formatImportedAccounts(accounts));
  });

  return () => subscription.unsubscribe();
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
  api: WithKeyring,
  wallet: Nullable<AppWallet>,
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

export const verifyAccountJson = (api: WithKeyring, pairJson: KeyringPair$Json, password: string): KeyringPair$Json => {
  const pair = api.createAccountPairFromJson(pairJson);
  const accountJson = pair.toJson(password);

  return accountJson;
};

export type CreateAccountArgs = {
  seed: string;
  name: string;
  password: string;
  passwordConfirm?: string;
  saveAccount?: boolean;
  exportAccount?: boolean;
};

export const createAccount = (
  api: WithKeyring,
  { seed, name, password, passwordConfirm, saveAccount, exportAccount }: CreateAccountArgs
): KeyringPair$Json => {
  if (passwordConfirm && password !== passwordConfirm) {
    throw new AppError({ key: 'desktop.errorMessages.passwords' });
  }

  const pair = api.createAccountPair(seed, name);
  const json = pair.toJson(password);

  if (exportAccount) {
    exportAccountJson(json);
  }

  if (saveAccount) {
    api.addAccountPair(pair, password);
  }

  return json;
};

export const exportAccount = (api: WithKeyring, { address, password }: { address: string; password: string }): void => {
  const pair = api.getAccountPair(address);
  const accountJson = pair.toJson(password);
  exportAccountJson(accountJson);
};

export const restoreAccount = (
  api: WithKeyring,
  { json, password }: { json: KeyringPair$Json; password: string }
): void => {
  // restore from json file
  api.restoreAccountFromJson(json, password);
};

export const deleteAccount = (api: WithKeyring, address?: string): void => {
  // delete account pair
  api.forgetAccount(address);
};
