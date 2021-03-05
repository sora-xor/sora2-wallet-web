export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletCreation = 'WalletCreation',
  WalletImport = 'WalletImport',
  WalletSend = 'WalletSend',
  WalletSettings = 'WalletSettings',
  WalletSettingsLanguage = 'WalletSettingsLanguage',
  WalletSettingsNetworks = 'WalletSettingsNetworks',
  WalletSettingsAbout = 'WalletSettingsAbout',
  WalletSettingsAdvanced = 'WalletSettingsAdvanced',
  Wallet = 'Wallet',
  WalletAssetDetails = 'WalletAssetDetails',
  CreateToken = 'CreateToken',
  AddAsset = 'AddAsset',
  WalletTransactionDetails = 'WalletTransactionDetails'
}

export enum SourceTypes {
  PolkadotJs = 'PolkadotJs',
  MnemonicSeed = 'MnemonicSeed',
  RawSeed = 'RawSeed'
}

export enum PasswordCondition {
  LowerCase = 'lowerCase',
  UpperCase = 'upperCase',
  Length = 'length',
  Digit = 'digit'
}

export enum WalletTabs {
  Assets = 'WalletAssets',
  Activity = 'WalletActivity'
}

export enum AddAssetTabs {
  Search = 'AddAssetSearch',
  Custom = 'AddAssetCustom'
}

export enum AccountMenu {
  View = 'view',
  Edit = 'edit',
  Logout = 'logout'
}

export enum SettingsMenu {
  Language = 'Language',
  Networks = 'Networks',
  About = 'About',
  Advanced = 'Advanced'
}

export interface Network {
  id: number;
  name: string;
  address: string;
  explorer: string;
  editable: boolean;
}

export enum Languages {
  EN = 'en'
}

export const PasswordConditions = [
  { title: PasswordCondition.LowerCase, regexp: /(?=.*[a-z])/ },
  { title: PasswordCondition.UpperCase, regexp: /(?=.*[A-Z])/ },
  { title: PasswordCondition.Length, regexp: /^.{8,}$/ },
  { title: PasswordCondition.Digit, regexp: /(?=.*\d)/ }
]

export interface SettingsMenuItem {
  title: string;
  desc: string;
  route: RouteNames;
  visible: boolean;
}

export interface WalletPermissions {
  sendAssets?: boolean;
  swapAssets?: boolean;
}

export interface WalletInitOptions {
  withoutStore?: boolean;
  permissions?: WalletPermissions;
}
