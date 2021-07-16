export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletSend = 'WalletSend',
  Wallet = 'Wallet',
  WalletAssetDetails = 'WalletAssetDetails',
  CreateToken = 'CreateToken',
  AddAsset = 'AddAsset',
  WalletTransactionDetails = 'WalletTransactionDetails',
  AddAssetDetails = 'AddAssetDetails'
}

export enum WalletTabs {
  Assets = 'WalletAssets',
  Activity = 'WalletActivity'
}

export enum AddAssetTabs {
  Search = 'AddAssetSearch',
  Custom = 'AddAssetCustom'
}

export enum Languages {
  EN = 'en'
}

export interface WalletPermissions {
  sendAssets?: boolean;
  swapAssets?: boolean;
}

export interface WalletInitOptions {
  withoutStore?: boolean;
  permissions?: WalletPermissions;
}
