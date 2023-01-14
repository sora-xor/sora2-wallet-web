import { Extensions } from '../consts';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';
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
  source?: Extensions;
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
  | 'filters'
  | 'allowFeePopup'
  | 'shouldBalanceBeHidden'
  | 'storageReferral'
  | 'slippageTolerance'
  | 'marketAlgorithm'
  | 'сhartsEnabled'
  | 'transactionDeadline'
  | 'evmAddress';

export type RuntimeStorageKey = 'version' | 'networkFees';
