import type { History, CodecString, FPNumber } from '@sora-substrate/util';

import type { SoraNetwork } from '../consts';

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: SoraNetwork;
  getAccountTransactions: (variables?: any) => Promise<any>;
}

export enum ModuleNames {
  Assets = 'assets',
  LiquidityProxy = 'liquidityProxy',
  Rewards = 'rewards',
  PoolXYK = 'poolXyk',
  TradingPair = 'tradingPair',
  Utility = 'utility',
}

export enum ModuleMethods {
  AssetsRegister = 'register',
  AssetsTransfer = 'transfer',
  PoolXYKInitializePool = 'initializePool',
  PoolXYKDepositLiquidity = 'depositLiquidity',
  PoolXYKWithdrawLiquidity = 'withdrawLiquidity',
  LiquidityProxySwap = 'swap',
  UtilityBatchAll = 'batchAll',
}

export type PoolXYKEntity = {
  strategicBonusApy: Nullable<string>;
  priceUSD: Nullable<string>;
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

export type UtilityBatchAllItem = {
  data: {
    args: {
      [key: string]: string | number;
    };
    callIndex: string;
  };
  hash: string;
  callId: string;
  module: string;
  method: string;
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
  timestamp: number;
  data: Nullable<
    | HistoryElementSwap
    | HistoryElementTransfer
    | HistoryElementLiquidityOperation
    | HistoryElementAssetRegistration
    | UtilityBatchAllItem[]
  >;
};

export type ReferrerRewards = {
  rewards: FPNumber;
  invitedUserRewards: {
    [key: string]: {
      rewards: FPNumber;
    };
  };
};

export type ReferrerReward = {
  id: string;
  blockHeight: string;
  referrer: string;
  referree: string;
  timestamp: number;
  amount: string;
};
