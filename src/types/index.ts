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

export enum BalanceTypes {
  Transferable = 'transferable',
  Frozen = 'frozen',
  Locked = 'locked',
  Reserved = 'reserved',
  Total = 'total'
}

export interface Account {
  address: string;
  name: string;
}
