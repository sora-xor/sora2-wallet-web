import { History } from '@sora-substrate/util'

export enum CursorPaginationItems {
  FIRST = 'first',
  LAST = 'last'
}

export enum CursorPaginationDirection {
  AFTER = 'after',
  BEFORE = 'before'
}

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<History | null>;
}

export interface Explorer {
  soraNetwork: string;
  getAccountTransactions: (params?: any) => Promise<Array<any>>;
  getTransaction: (params?: any) => Promise<any>;
}
