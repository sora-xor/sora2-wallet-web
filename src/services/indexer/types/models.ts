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

import type { PriceVariant, OrderBookStatus } from '@sora-substrate/liquidity-proxy';
import type { CodecString } from '@sora-substrate/util';

// Indexer Enums
export enum SnapshotTypes {
  DEFAULT = 'DEFAULT',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}

export enum OrderStatus {
  Active = 'Active',
  Aligned = 'Aligned',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Filled = 'Filled',
}

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
}

// Indexer Models
/* eslint-disable camelcase */

export type PriceSnapshot = {
  low: string;
  high: string;
  open: string;
  close: string;
};

export type AssetBaseEntity = {
  id: string;
  liquidity: CodecString;
  liquidityUSD?: number;
  priceUSD: string;
  priceChangeDay?: number;
  priceChangeWeek?: number;
  supply: CodecString;
  volumeDayUSD?: number;
  volumeWeekUSD?: number;
  velocity?: number;
};

export type AssetSnapshotBaseEntity = {
  id: string;
  assetId: string;
  priceUSD: PriceSnapshot;
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

export type OrderBookDealEntity = {
  orderId: number;
  timestamp: number;
  isBuy: boolean;
  amount: string;
  price: string;
};

export type OrderBookOrderBaseEntity = {
  id: string;
  type: OrderType;
  orderId: Nullable<number>;
  orderBookId: string; // connection field
  accountId: string; // connection field
  createdAtBlock: number;
  timestamp: number;
  isBuy: boolean;
  amount: string;
  price: string;
  lifetime: number;
  expiresAt: number;
  amountFilled: string;
  status: OrderStatus;
  updatedAtBlock: number;
};

export type OrderBookBaseEntity = {
  id: string;
  dexId: number;
  baseAssetId: string; // connection field
  quoteAssetId: string; // connection field
  status: OrderBookStatus;
  price?: string;
  priceChangeDay?: number;
  volumeDayUSD?: string;
  lastDeals?: string; // stringified JSON OrderBookDealEntity[]
  updatedAtBlock: number;
};

export type OrderBookSnapshotBaseEntity = {
  id: string;
  orderBookId: string; // connection field
  timestamp: number;
  type: SnapshotTypes;
  price: PriceSnapshot;
  baseAssetVolume: string;
  quoteAssetVolume: string;
  volumeUSD: string;
};

// with connection
export type OrderBookEntity = OrderBookBaseEntity & {
  baseAsset: AssetBaseEntity;
  quoteAsset: AssetBaseEntity;
  orders: OrderBookOrderBaseEntity[];
};
// with connection
export type OrderBookSnapshotEntity = OrderBookSnapshotBaseEntity & {
  orderBook: OrderBookBaseEntity;
};
// with connection
export type OrderBookOrderEntity = OrderBookOrderBaseEntity & {
  orderBook: OrderBookBaseEntity;
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
  assetFee?: string; // only in xorless transfer
  xorFee?: string; // only in xorless transfer
  comment?: string; // only in xorless transfer
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

export type HistoryElementPlaceLimitOrder = {
  dexId: number;
  baseAssetId: string;
  quoteAssetId: string;
  orderId: number | undefined;
  price: string;
  amount: string;
  side: PriceVariant;
  lifetime: number | undefined;
};

export type HistoryElementCancelLimitOrder = Array<{
  dexId: number;
  baseAssetId: string;
  quoteAssetId: string;
  orderId: number;
}>;

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
  | HistoryElementPlaceLimitOrder
  | HistoryElementCancelLimitOrder
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
