import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

export enum Modules {
  Account = 'Account',
  Router = 'Router',
  Settings = 'Settings',
  Transactions = 'Transactions',
  Subscriptions = 'Subscriptions',
}

export enum Operations {
  Send = 'send',
  Receive = 'receive',
  Swap = 'swap',
  Liquidity = 'liquidity',
  Bridge = 'bridge',
}

export interface PolkadotJsAccount {
  address: string;
  name: string;
}

export interface Account extends PolkadotJsAccount {
  isExternal: boolean;
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
