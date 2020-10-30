export enum RouteNames {
  WalletConnection = 'Connection',
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

export const PasswordConditions = [
  { title: PasswordCondition.LowerCase, regexp: /(?=.*[a-z])/ },
  { title: PasswordCondition.UpperCase, regexp: /(?=.*[A-Z])/ },
  { title: PasswordCondition.Length, regexp: /^.{8,}$/ },
  { title: PasswordCondition.Digit, regexp: /(?=.*\d)/ }
]
