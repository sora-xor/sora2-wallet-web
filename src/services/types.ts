import { History } from '@sora-substrate/util'

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<History | null>;
}

export interface Explorer {
  soraNetwork: string;
  getAccountTransactions: (params?: any) => Promise<any>;
}
