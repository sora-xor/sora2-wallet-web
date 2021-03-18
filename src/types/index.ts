import { Asset, AccountAsset } from '@sora-substrate/util'

export enum Components {
  SoraNeoWallet = 'SoraNeoWallet'
}

export enum Modules {
  Account = 'Account',
  Router = 'Router',
  Settings = 'Settings',
  Transactions = 'Transactions'
}

export type NamedAsset = Asset & { name: string }
export type NamedAccountAsset = AccountAsset & { name: string }
