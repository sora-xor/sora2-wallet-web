import { Operation } from '@sora-substrate/sdk';
import { XSTUSD, KUSD, KGOLD, KEN, KXOR } from '@sora-substrate/sdk/build/assets/consts';

import type { FPNumber } from '@sora-substrate/sdk';

export const accountIdBasedOperations = [
  Operation.SwapAndSend,
  Operation.Transfer,
  Operation.SwapTransferBatch,
  Operation.Mint,
];

export const syntheticAssetRegexp = new RegExp(`^0[xX]03[0-9a-fA-F]+|${XSTUSD.address}$`);
export const kensetsuAssetRegexp = new RegExp(
  `^0[xX]05[0-9a-fA-F]+|${KUSD.address}|${KGOLD.address}|${KXOR.address}|${KEN.address}$`
);

export const HiddenValue = '******';

export const BLOCK_PRODUCE_TIME = 6_000;
export const MAX_ALERTS_NUMBER = 10;

export const Links = {
  connection: {
    wiki: 'https://wiki.sora.org/polkaswap-connect-wallet.html',
  },
};

export enum IndexerType {
  SUBQUERY = 'subquery',
  SUBSQUID = 'subsquid',
}

export enum AppWallet {
  Sora = 'sora',
  WalletConnect = 'walletconnect',
  GoogleDrive = 'google-drive',
  FearlessWallet = 'fearless-wallet',
  PolkadotJS = 'polkadot-js',
  SubwalletJS = 'subwallet-js',
  TalismanJS = 'talisman',
}

export enum AccountActionTypes {
  // Account
  Rename = 'rename',
  Export = 'export',
  Logout = 'logout',
  Delete = 'delete',
  // Book
  BookSend = 'bookSend',
  BookEdit = 'bookEdit',
  BookDelete = 'bookDelete',
}

export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletSend = 'WalletSend',
  Wallet = 'Wallet',
  WalletAssetDetails = 'WalletAssetDetails',
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
  SBT = 'SBT',
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
  Import = 'Import',
  ImportCredentials = 'Import/Credentials',
  SeedPhrase = 'Create/SeedPhrase',
  ConfirmSeedPhrase = 'Create/ConfirmSeedPhrase',
  CreateCredentials = 'Create/Credentials',
  AccountList = 'AccountList',
  ExtensionList = 'ExtensionList',
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
  appName?: string;
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

export enum PassphraseTimeout {
  FIFTEEN_MINUTES = '15m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1D',
  ONE_WEEK = '1W',
}

export const PassphraseTimeoutDuration: Record<PassphraseTimeout, number> = {
  [PassphraseTimeout.FIFTEEN_MINUTES]: 15 * 60 * 1000,
  [PassphraseTimeout.ONE_HOUR]: 60 * 60 * 1000,
  [PassphraseTimeout.FOUR_HOURS]: 4 * 60 * 60 * 1000,
  [PassphraseTimeout.ONE_DAY]: 24 * 60 * 60 * 1000,
  [PassphraseTimeout.ONE_WEEK]: 7 * 24 * 60 * 60 * 1000,
};

export const DefaultPassphraseTimeout = PassphraseTimeoutDuration[PassphraseTimeout.FIFTEEN_MINUTES];

export const ObjectInit = () => null;

/**
 * DO NOT IMPORT THIS CONST if you use TranslationMixin
 *
 * Contains wallet-specific words which shouldn't be translated.
 * It's used in TranslationMixin of SORA Wallet project and it's extended in Polkaswap TranslationMixin.
 */
export const TranslationConsts = {
  Polkaswap: 'Polkaswap',
  Ethereum: 'Ethereum',
  Etherscan: 'Etherscan',
  Hashi: 'HASHI',
  PolkadotJs: 'Polkadot{.js}',
  Sora: 'SORA',
  TBC: 'TBC',
  XYK: 'XYK',
  NFT: 'NFT',
  SBT: 'SBT',
  CEX: 'CEX',
  KYC: 'KYC',
  Polkadot: 'Polkadot',
  SORAScan: 'SORAScan',
  Subscan: 'Subscan',
  CedeStore: 'cede.store',
  QR: 'QR', // QR code
  IPFS: 'IPFS', // Inter-planetary file system
  // SORA networks
  soraNetwork: {
    Dev: 'SORA Devnet',
    Test: 'SORA Testnet (private)',
    Stage: 'SORA Testnet',
    Prod: 'SORA Mainnet',
  },
  JSON: 'JSON',
  ADAR: 'ADAR',
  Google: 'Google',
  Kensetsu: 'Kensetsu',
  Ceres: 'Ceres',
} as const;

export const CeresAddresses = [
  '0x002d4e9e03f192cc33b128319a049f353db98fbf4d98f717fd0b7f66a0462142',
  '0x00efe45135018136733be626b380a87ae663ccf6784a25fe9d9d2be64acecb9d',
  '0x00f2f4fda40a4bf1fc3769d156fa695532eec31e265d75068524462c0b80f674',
  '0x008bcfd2387d3fc453333557eecb0efe59fcba128769b2feefdd306e98e66440',
];
