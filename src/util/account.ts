import { saveAs } from 'file-saver';

import { AppWallet } from '../consts';
import { isInternalSource, getWallet, checkWallet } from '../services/wallet';
import { AppError, formatAccountAddress } from '../util';

import type { WalletAccount } from '../services/wallet/types';
import type { KeyringPair$Json, PolkadotJsAccount } from '../types/common';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Signer } from '@polkadot/types/types';
import type { WithKeyring } from '@sora-substrate/sdk';

export { isAppStorageSource } from '../services/wallet';

export const lockAccountPair = (api: WithKeyring): void => {
  api.lockPair();
};

export const unlockAccountPair = (api: WithKeyring, password: string): void => {
  api.unlockPair(password);
};

export const loginApi = async (api: WithKeyring, accountData: PolkadotJsAccount, currentAccountStoredInApp = false) => {
  const source = accountData.source;
  const isExternal = !isInternalSource(source);
  const defaultAddress = api.formatAddress(accountData.address, false);
  const apiAddress = api.formatAddress(defaultAddress);
  const forget = !currentAccountStoredInApp && api.address !== apiAddress;

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

export const updateApiSigner = async (api: WithKeyring, source: AppWallet): Promise<void> => {
  const wallet = await getWallet(source);

  api.setSigner(wallet.signer as Signer);
};

const formatWalletAccounts = (accounts: Nullable<WalletAccount[]>): PolkadotJsAccount[] => {
  return (accounts || []).map((account) => ({
    address: account.address,
    name: account.name || '',
    source: account.source as AppWallet,
  }));
};

export const checkExternalAccount = async (account: PolkadotJsAccount): Promise<void> => {
  const wallet = checkWallet(account.source);
  const accounts = await wallet.getAccounts();

  if (!accounts) throw new Error('No accounts');

  const search = formatAccountAddress(account.address, false);

  const exists = accounts.some((account) => formatAccountAddress(account.address, false) === search);

  if (!exists) throw new Error(`Account not found: ${account.address}`);
};

export const subscribeToWalletAccounts = async (
  api: WithKeyring,
  wallet: AppWallet,
  callback: (accounts: PolkadotJsAccount[]) => void
): Promise<Nullable<Unsubcall>> => {
  const appWallet = await getWallet(wallet);
  const accounts = await appWallet.getAccounts();

  callback(formatWalletAccounts(accounts));

  const unsubscribe = await appWallet.subscribeAccounts((injectedAccounts) => {
    callback(formatWalletAccounts(injectedAccounts));
  });

  return unsubscribe;
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
