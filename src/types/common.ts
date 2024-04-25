import type { AppWallet } from '../consts';
import type { Asset, AccountAsset } from '@sora-substrate/util/build/assets/types';

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

/** `{ address: name }` */
export type Book = Record<string, string>;

export type PolkadotJsAccount = {
  address: string;
  name: string;
  identity?: string;
  source?: AppWallet;
};

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

export type AssetsTable = Record<string, Asset>;

export type AccountAssetsTable = Record<string, AccountAsset>;

export enum ConnectionStatus {
  Loading = 'loading',
  Unavailable = 'unavailable',
  Available = 'available',
}

export type IndexerState = {
  endpoint: Nullable<string>;
  status: ConnectionStatus;
};

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
  | 'exploreAccountItems'
  | 'exploreSyntheticTokens';

export type RuntimeStorageKey = 'version' | 'networkFees' | 'feeMultiplier';
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
  | 'book'
  | 'indexerType'
  | 'ceresFiatValues'
  | 'currency'
  | 'signTxDialogDisabled'
  | 'confirmTxDialogEnabled'
  | 'accountPasswordTimeout';

export type NotificationType = 'balanceChange' | 'priceAlert';
