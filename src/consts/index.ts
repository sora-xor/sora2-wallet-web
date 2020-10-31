export enum RouteNames {
  WalletConnection = 'WalletConnection',
  WalletCreation = 'WalletCreation',
  WalletImport = 'WalletImport',
  WalletSettings = 'WalletSettings',
  Wallet = 'Wallet'
}

export enum SourceTypes {
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
  Assets = 'assets',
  Activity = 'activity'
}

export enum AccountMenu {
  View = 'view',
  Edit = 'edit',
  Logout = 'logout'
}

export const PasswordConditions = [
  { title: PasswordCondition.LowerCase, regexp: /(?=.*[a-z])/ },
  { title: PasswordCondition.UpperCase, regexp: /(?=.*[A-Z])/ },
  { title: PasswordCondition.Length, regexp: /^.{8,}$/ },
  { title: PasswordCondition.Digit, regexp: /(?=.*\d)/ }
]
