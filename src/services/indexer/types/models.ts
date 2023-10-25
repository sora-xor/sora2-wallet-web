import {
  SubqueryAccountEntityMutation,
  SubqueryAssetEntity,
  SubqueryHistoryElement,
  SubqueryHistoryElementData,
  SubqueryPoolXYKEntity,
  SubqueryUtilityBatchCall,
} from '../subquery/types';
import {
  SubsquidAccountEntityMutation,
  SubsquidAssetEntity,
  SubsquidHistoryElement,
  SubsquidHistoryElementCalls,
  SubsquidPoolXYKEntity,
  SubsquidUtilityBatchCall,
} from '../subsquid/types';

import type { CodecString } from '@sora-substrate/util';

// Indexer Enums
export enum SnapshotTypes {
  DEFAULT = 'DEFAULT',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}

// Indexer Models
/* eslint-disable camelcase */

export type AssetBaseEntity = {
  id: string;
  liquidity: string;
  liquidityUSD?: number;
  priceUSD: string;
  priceChangeDay?: number;
  priceChangeWeek?: number;
  supply: string;
  volumeDayUSD?: number;
  volumeWeekUSD?: number;
  velocity?: number;
};

export type AssetSnapshotBaseEntity = {
  id: string;
  assetId: string;
  priceUSD: {
    low: string;
    high: string;
    open: string;
    close: string;
  };
  volume: {
    amount: string;
    amountUSD: string;
  };
  timestamp: number;
  type: SnapshotTypes;
  liquidity: Nullable<CodecString>;
  supply: CodecString;
  mint: CodecString;
  burn: CodecString;
};

// with connection
export type AssetSnapshotEntity = AssetSnapshotBaseEntity & {
  asset: AssetBaseEntity;
};

export type PoolXYKBaseEntity = {
  id: string;
  baseAssetReserves: CodecString;
  targetAssetReserves: CodecString;
  multiplier: number;
  priceUSD: Nullable<string>;
  strategicBonusApy: Nullable<string>;
};

export type NetworkStatsEntity = {
  id: string;
  totalFees: CodecString;
  totalAccounts: number;
  totalTransactions: number;
  totalBridgeIncomingTransactions: number;
  totalBridgeOutgoingTransactions: number;
};

export type NetworkSnapshotEntity = {
  id: string;
  type: SnapshotTypes;
  timestamp: number;
  accounts: number;
  transactions: number;
  fees: CodecString;
  liquidityUSD: string;
  volumeUSD: string;
  bridgeIncomingTransactions: number;
  bridgeOutgoingTransactions: number;
};

export type ReferrerRewardEntity = {
  id: string;
  referral: string;
  referrer: string;
  updated: number;
  amount: CodecString;
};
/* eslint-enable camelcase */

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

export type HistoryElementSwapTransfer = HistoryElementSwap & {
  to: string;
};

export type SwapTransferBatchTransferParam = {
  from: string;
  to: string;
  amount: string;
  assetId: string;
};

type SwapTransferBatchExchangeParam = {
  from: string;
  to: string;
  amount: string;
  assetId: string;
};

export type HistoryElementSwapTransferBatch = {
  inputAssetId: string;
  selectedMarket: string;
  liquidityProviderFee: string;
  maxInputAmount: string;
  blockNumber: string;
  from: string;

  adarFee: string;
  inputAmount: string;
  networkFee: string;
  actualFee: string;
  receivers: any;

  transfers: Array<SwapTransferBatchTransferParam>;
  exchanges: Array<SwapTransferBatchExchangeParam>;
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

export type HistoryElementDemeterFarming = {
  amount: string;
  assetId: string;
  isFarm: boolean;
  rewardAssetId?: string;
  baseAssetId?: string;
};

export type ClaimedRewardItem = {
  assetId: string;
  amount: string;
};

export type HistoryElementRewardsClaim = Nullable<ClaimedRewardItem[]>;

export type ExtrinsicEvent = {
  method: string;
  section: string;
  data: any[];
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

export type ReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type ReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type HistoryElementDataBase = Nullable<
  | ReferralSetReferrer
  | ReferrerReserve
  | HistoryElementSwap
  | HistoryElementSwapTransfer
  | HistoryElementTransfer
  | HistoryElementLiquidityOperation
  | HistoryElementAssetRegistration
  | HistoryElementEthBridgeOutgoing
  | HistoryElementEthBridgeIncoming
  | HistoryElementRewardsClaim
  | HistoryElementDemeterFarming
  | HistoryElementSwapTransferBatch
>;

export type HistoryElementBase = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: HistoryElementExecution;
  timestamp: number;
};

export type AssetEntity = SubqueryAssetEntity | SubsquidAssetEntity;

export type PoolXYKEntity = SubqueryPoolXYKEntity | SubsquidPoolXYKEntity;

export type UtilityBatchCall = SubqueryUtilityBatchCall | SubsquidUtilityBatchCall;

export type HistoryElementData = SubqueryHistoryElementData;

export type HistoryElementCalls = SubsquidHistoryElementCalls;

export type HistoryElement = SubqueryHistoryElement | SubsquidHistoryElement;

export type AccountEntity = SubqueryAccountEntityMutation | SubsquidAccountEntityMutation;
