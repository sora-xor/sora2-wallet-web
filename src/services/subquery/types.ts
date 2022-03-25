import type { History, CodecString, FPNumber } from '@sora-substrate/util';

import type { SoraNetwork } from '../../consts';

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
  PoolXYK = 'poolXYK',
  TradingPair = 'tradingPair',
  Utility = 'utility',
  Referrals = 'referrals',
  EthBridge = 'ethBridge',
  BridgeMultisig = 'bridgeMultisig',
}

export enum ModuleMethods {
  AssetsRegister = 'register',
  AssetsTransfer = 'transfer',
  PoolXYKInitializePool = 'initializePool',
  PoolXYKDepositLiquidity = 'depositLiquidity',
  PoolXYKWithdrawLiquidity = 'withdrawLiquidity',
  LiquidityProxySwap = 'swap',
  UtilityBatchAll = 'batchAll',
  ReferralsSetReferrer = 'setReferrer',
  ReferralsReserve = 'reserve',
  ReferralsUnreserve = 'unreserve',
  EthBridgeTransferToSidechain = 'transferToSidechain',
  BridgeMultisigAsMulti = 'asMulti',
}

export type PoolXYKEntity = {
  strategicBonusApy: Nullable<string>;
  priceUSD: Nullable<string>;
  targetAssetId: string;
};

export type FiatPriceAndApyObject = {
  [key: string]: {
    price?: CodecString;
    strategicBonusApy?: CodecString;
  };
};

/**
 * `key` is timestamp, `value` is price USD
 */
export type HistoricalPrice = {
  [key: number]: CodecString;
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

export type AddressKeyMapping = {
  [key: string]: string | null;
};

export type HistoryElementEthBridgeOutgoing = {
  amount: string;
  assetId: string;
  sidechainAddress: string;
  requestHash?: string;
};

export type HistoryElementEthBridgeIncoming = {
  amount: string;
  assetId: string;
  requestHash: string;
  to: string;
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
    | ReferralSetReferrer
    | ReferrerReserve
    | HistoryElementEthBridgeOutgoing
    | HistoryElementEthBridgeIncoming
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
  referral: string;
  timestamp: number;
  amount: string;
};

export type ReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type ReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};
