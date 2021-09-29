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
  sendAssets?: boolean;
  swapAssets?: boolean;
}

export interface WalletInitOptions {
  withoutStore?: boolean;
  permissions?: WalletPermissions;
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
