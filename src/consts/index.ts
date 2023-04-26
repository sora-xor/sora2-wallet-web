import type { FPNumber, Operation } from '@sora-substrate/util';

export const HiddenValue = '******';

export const BLOCK_PRODUCE_TIME = 6_000;
export const MAX_ALERTS_NUMBER = 5;

export enum AppWallet {
  GoogleDrive = 'google-drive',
  FearlessWallet = 'fearless-wallet',
  PolkadotJS = 'polkadot-js',
  SubwalletJS = 'subwallet-js',
  TalismanJS = 'talisman',
}

export enum AccountActionTypes {
  Rename = 'rename',
  Export = 'export',
  Logout = 'logout',
  Delete = 'delete',
}

export enum RouteNames {
  InternalConnection = 'InternalConnection',
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
  History = 'WalletHistory',
}

export enum TokenTabs {
  Token = 'CreateSimpleToken',
  NonFungibleToken = 'CreateNftToken',
}

export enum AddAssetTabs {
  Token = 'AddAssetToken',
  NFT = 'AddAssetNFT',
}

export enum WalletFilteringOptions {
  All = 'All',
  Currencies = 'Currencies',
  NFT = 'NFT',
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
  EthAccount = 'ethAccount',
  EthTransaction = 'ethTransaction',
}

export enum ExplorerType {
  Sorascan = 'sorascan',
  Subscan = 'subscan',
  Polkadot = 'polkadot',
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
  ImportExternalExtensionList = 'ImportExternal/ExtensionList',
  ImportExternalAcccountList = 'ImportExternal/AccountList',
  SeedPhrase = 'Create/SeedPhrase',
  ConfirmSeedPhrase = 'Create/ConfirmSeedPhrase',
  CreateCredentials = 'Create/Credentials',
  AccountList = 'AccountList',
}

export const AccountImportInternalFlow = [LoginStep.Import, LoginStep.ImportCredentials];
export const AccountImportExternalFlow = [LoginStep.ImportExternalExtensionList, LoginStep.ImportExternalAcccountList];
export const AccountCreateFlow = [LoginStep.SeedPhrase, LoginStep.ConfirmSeedPhrase, LoginStep.CreateCredentials];

export interface WalletPermissions {
  addAssets?: boolean;
  addLiquidity?: boolean;
  bridgeAssets?: boolean;
  createAssets?: boolean;
  sendAssets?: boolean;
  showAssetDetails?: boolean;
  swapAssets?: boolean;
}

export type EthBridgeUpdateHistory = (updateWalletHistory: VoidFunction) => Promise<void>;

export interface WalletAssetFilters {
  option: WalletFilteringOptions;
  verifiedOnly: boolean;
  zeroBalance: boolean;
}

export interface WalletInitOptions {
  withoutStore?: boolean;
  permissions?: WalletPermissions;
  updateEthBridgeHistory?: EthBridgeUpdateHistory;
}

export interface NetworkFeeWarningOptions {
  type: Operation;
  isXor?: boolean;
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

// states for Ethereum Bridge transaction
export enum ETH_BRIDGE_STATES {
  INITIAL = 'INITIAL',
  SORA_SUBMITTED = 'SORA_SUBMITTED',
  SORA_PENDING = 'SORA_PENDING',
  SORA_REJECTED = 'SORA_REJECTED',
  SORA_COMMITED = 'SORA_COMMITED',
  EVM_SUBMITTED = 'EVM_SUBMITTED',
  EVM_PENDING = 'EVM_PENDING',
  EVM_REJECTED = 'EVM_REJECTED',
  EVM_COMMITED = 'EVM_COMMITED',
}

export const ObjectInit = () => null;

/**
 * DO NOT IMPORT THIS CONST!
 *
 * Contains wallet-specific words which shouldn't be translated.
 * It's used in TranslationMixin of SORA Wallet project and it's extended in Polkaswap TranslationMixin.
 */
export const TranslationConsts = {
  Ethereum: 'Ethereum',
  Etherscan: 'Etherscan',
  Hashi: 'HASHI',
  PolkadotJs: 'Polkadot{.js}',
  Sora: 'SORA',
  TBC: 'TBC',
  XYK: 'XYK',
  NFT: 'NFT',
  Polkadot: 'Polkadot',
  SORAScan: 'SORAScan',
  Subscan: 'Subscan',
  QR: 'QR', // QR code
  IPFS: 'IPFS', // Inter-planetary file system
  // SORA networks
  soraNetwork: {
    Dev: 'SORA Devnet',
    Test: 'SORA Testnet (private)',
    Stage: 'SORA Testnet',
    Prod: 'SORA Mainnet',
  },
  JSON: '.json',
} as const;
