import type { FPNumber, Operation } from '@sora-substrate/util';

export const HiddenValue = '******';

export const NFT_STORAGE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBmMzgwOTMyQTNDODM3ZDNiN2JEYzBBNTc0NmNkMDlBRGIyNUZGMzQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MjU4OTQ2ODA4MSwibmFtZSI6Im5mdC1zdG9yYWdlLWRldiJ9.hkvzea9ltcriXXHKoYd3F2Iu1Y8X5H-zunAQboC_3vw';

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

export enum TokenTabs {
  Token = 'CreateSimpleToken',
  NonFungibleToken = 'CreateNftToken',
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

export enum Step {
  CreateSimpleToken = 'CreateSimpleToken',
  ConfirmSimpleToken = 'ConfirmSimpleToken',
  CreateNftToken = 'CreateNftToken',
  ConfirmNftToken = 'ConfirmNftToken',
  Warn = 'Warn',
}

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
  isXorAccountAsset?: boolean;
  amount?: FPNumber;
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
