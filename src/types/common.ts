import { Extensions } from '../consts';
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
  Swap = 'swap',
  Liquidity = 'liquidity',
  Bridge = 'bridge',
}

export interface PolkadotJsAccount {
  address: string;
  name: string;
  source?: Extensions;
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
