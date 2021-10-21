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

export type HistoryElementError = {
  moduleErrorId: number;
  moduleErrorIndex: number;
};

export type HistoryElementExecution = {
  success: boolean;
  error?: HistoryElementError;
};

export type HistoryElementSwap = {
  baseAssetAmount: string;
  baseAssetId: string;
  liquidityProviderFee: string;
  selectedMarket: string;
  targetAssetAmount: string;
  targetAssetId: string;
};

export type HistoryElementTransfer = {
  amount: string;
  assetId: string;
  from: string;
  to: string;
};

export type HistoryElementLiquidityOperation = {
  baseAssetAmount: string;
  baseAssetId: string;
  targetAssetAmount: string;
  targetAssetId: string;
  type: string;
};

export type HistoryElementAssetRegistration = {
  assetId: string;
};

export type HistoryElement = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: HistoryElementExecution;
  timestamp: string;
  data: Nullable<
    HistoryElementSwap | HistoryElementTransfer | HistoryElementLiquidityOperation | HistoryElementAssetRegistration
  >;
};
