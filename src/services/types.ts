import { History, CodecString } from '@sora-substrate/util'

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: string;
  getAccountTransactions: (params?: any) => Promise<any>;
}

export type PoolXYKEntity = {
  strategicBonusApy: string;
  priceUSD: string;
  targetAssetId: string;
}

export type FiatPriceAndApyObject = {
  [key: string]: {
    price: CodecString;
    strategicBonusApy?: CodecString;
  };
}
