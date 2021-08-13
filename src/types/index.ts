export enum Components {
  SoraNeoWallet = 'SoraNeoWallet'
}

export enum Modules {
  Account = 'Account',
  Router = 'Router',
  Settings = 'Settings',
  Transactions = 'Transactions'
}

export enum Operations {
  Send = 'send',
  Receive = 'receive',
  Swap = 'swap',
  Liquidity = 'liquidity',
  Bridge = 'bridge'
}

export interface Account {
  address: string;
  name: string;
}

export enum FontSizeRate {
  SMALL = 'small',
  MEDIUM = 'medium',
  NORMAL = 'normal'
}

export enum FontWeightRate {
  SMALL = 'small',
  MEDIUM = 'medium',
  NORMAL = 'normal'
}
