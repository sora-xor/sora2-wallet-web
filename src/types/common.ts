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

export interface PolkadotJsAccount {
  address: string;
  name: string;
  source?: AppWallet;
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
  | 'transactionDeadline'
  | 'evmAddress';

export type RuntimeStorageKey = 'version' | 'networkFees';
export type SettingsStorageKey =
  | 'language'
  | 'node'
  | 'customNodes'
  | 'allowFeePopup'
  | 'disclaimerApprove'
  | 'allowAccountDeletePopup';
