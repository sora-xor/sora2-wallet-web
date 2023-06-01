import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import type { AppWallet } from '../consts';
export type { KeyringPair$Json } from '@polkadot/keyring/types';

export enum Modules {
  Account = 'Account',
  Router = 'Router',
  Settings = 'Settings',
  Transactions = 'Transactions',
  Subscriptions = 'Subscriptions',
}

export enum Operations {
  Send = 'send',
  Swap = 'swap',
  Liquidity = 'liquidity',
  Bridge = 'bridge',
}

export type AddressKeyMapping = {
  [key: string]: string | null;
};

export type Book = {
  address: string;
};

export type AccountBook = {
  address: string;
  name: string;
  identity?: string;
};

export interface PolkadotJsAccount {
  address: string;
  name: string;
  source?: AppWallet;
}

export interface Alert {
  token: string;
  price: string;
  type: 'drop' | 'raise';
  once: boolean;
  wasNotified?: boolean;
}

export type WhitelistIdsBySymbol = { [key: string]: string };

export type Permissions = {
  sendAssets: boolean;
  swapAssets: boolean;
};

export type ApiKeysObject = {
  [key: string]: string;
};

export type AccountAssetsTable = {
  [key: string]: AccountAsset;
};

export enum ConnectionStatus {
  Loading = 'loading',
  Unavailable = 'unavailable',
  Available = 'available',
}

export type StorageKey =
  | 'address'
  | 'name'
  | 'source'
  | 'isExternal'
  | 'filters'
  | 'shouldBalanceBeHidden'
  | 'storageReferral'
  | 'slippageTolerance'
  | 'marketAlgorithm'
  | 'сhartsEnabled'
  | 'transactionDeadline';

export type RuntimeStorageKey = 'version' | 'networkFees';
export type SettingsStorageKey =
  | 'alerts'
  | 'language'
  | 'node'
  | 'customNodes'
  | 'allowFeePopup'
  | 'allowTopUpAlerts'
  | 'disclaimerApprove'
  | 'allowAccountDeletePopup'
  | 'evmAddress'
  | 'evmNetwork'
  | 'bridgeType'
  | 'book';

export type NotificationType = 'balanceChange' | 'priceAlert';
