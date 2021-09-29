import type { History, CodecString } from '@sora-substrate/util';

import type { SoraNetwork } from '../consts';

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: SoraNetwork;
  getAccountTransactions: (params?: any) => Promise<any>;
}

export type PoolXYKEntity = {
  strategicBonusApy: string;
  priceUSD: string;
  targetAssetId: string;
};

export type FiatPriceAndApyObject = {
  [key: string]: {
    price: CodecString;
    strategicBonusApy?: CodecString;
  };
};
