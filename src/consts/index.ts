import { Operation } from '@sora-substrate/util';

export const HiddenValue = '******';

export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletSend = 'WalletSend',
  Wallet = 'Wallet',
  WalletAssetDetails = 'WalletAssetDetails',
  CreateToken = 'CreateToken',
  AddAsset = 'AddAsset',
  WalletTransactionDetails = 'WalletTransactionDetails',
  AddAssetDetails = 'AddAssetDetails',
}

export enum WalletTabs {
  Assets = 'WalletAssets',
  Activity = 'WalletActivity',
}

export enum AddAssetTabs {
  Search = 'AddAssetSearch',
  Custom = 'AddAssetCustom',
}

export enum SoraNetwork {
  Dev = 'Dev',
  Test = 'Test',
  Stage = 'Stage',
  Prod = 'Prod',
}

export enum HashType {
  ID = 'id',
  Block = 'block',
  Account = 'account',
}

export enum ExplorerType {
  Sorascan = 'sorascan',
  Subscan = 'subscan',
}

export type ExplorerLink = {
  type: ExplorerType;
  value: string;
};

export interface WalletPermissions {
  addAssets?: boolean;
  addLiquidity?: boolean;
  bridgeAssets?: boolean;
  copyAssets?: boolean;
  createAssets?: boolean;
  sendAssets?: boolean;
  showAssetDetails?: boolean;
  swapAssets?: boolean;
}

export interface WalletInitOptions {
  withoutStore?: boolean;
  whiteListOverApi?: boolean;
  permissions?: WalletPermissions;
}

export interface NetworkFeeWarningOptions {
  type: Operation;
  isExternalTx?: boolean;
  isXorAccountAsset?: boolean;
  xorBalance: string;
  amount?: string;
  fee: string;
}

export enum FontSizeRate {
  SMALL = 'small',
  MEDIUM = 'medium',
  NORMAL = 'normal',
}

export enum FontWeightRate {
  SMALL = 'small',
  MEDIUM = 'medium',
  NORMAL = 'normal',
}
