import { History, CodecString } from '@sora-substrate/util'

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: string;
  getAccountTransactions: (params?: any) => Promise<any>;
}

export type PoolXYKEntity = {
  apy: string;
  baseAssetReserves: string;
  priceUSD: string;
  targetAssetId: string;
  targetAssetReserves: string;
}

export type FiatPriceAndApyObject = {
  [key: string]: {
    price: CodecString;
    apy?: CodecString;
  };
}
