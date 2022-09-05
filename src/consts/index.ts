import type { FPNumber, Operation } from '@sora-substrate/util';

export const HiddenValue = '******';

export const BLOCK_PRODUCE_TIME = 6 * 1000;

export enum Extensions {
  PolkadotJS = 'polkadot-js',
  SubwalletJS = 'subwallet-js',
  TalismanJS = 'talisman',
}

export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletSend = 'WalletSend',
  Wallet = 'Wallet',
  WalletAssetDetails = 'WalletAssetDetails',
  CreateToken = 'CreateToken',
  ReceiveToken = 'ReceiveToken',
  AddAsset = 'AddAsset',
  SelectAsset = 'SelectAsset',
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
  Token = 'AddAssetToken',
  NFT = 'AddAssetNFT',
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

export enum LoginStep {
  Welcome = 'Welcome',
  Import = 'Import',
  ImportCredentials = 'Import/Credentials',
  SeedPhrase = 'Create/SeedPhrase',
  ConfirmSeedPhrase = 'Create/ConfirmSeedPhrase',
  CreateCredentials = 'Create/Credentials',
  AccountList = 'AccountList',
}

export interface WalletPermissions {
  addAssets?: boolean;
  addLiquidity?: boolean;
  bridgeAssets?: boolean;
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

export enum LogoSize {
  MINI = 'mini',
  SMALL = 'small',
  MEDIUM = 'medium',
  BIG = 'big',
  BIGGER = 'bigger',
  LARGE = 'large',
}

export enum PaginationButton {
  First = 'first',
  Prev = 'prev',
  Next = 'next',
  Last = 'last',
}

export const ObjectInit = () => null;
