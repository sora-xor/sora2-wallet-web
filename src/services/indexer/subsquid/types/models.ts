import { SnapshotTypes } from '../../types';

import type { CodecString } from '@sora-substrate/util';

// Subsquid Models
/* eslint-disable camelcase */
export type SubsquidAssetBaseEntity = {
  id: string;
  priceUSD: string;
  supply: string;
  liquidity: string;
};

export type SubsquidAssetSnapshotBaseEntity = {
  id: string;
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

export type SubsquidPoolXYKBaseEntity = {
  id: string;
  baseAsset: SubsquidAssetBaseEntity;
  targetAsset: SubsquidAssetBaseEntity;
  baseAssetReserves: CodecString;
  targetAssetReserves: CodecString;
  multiplier: number;
  priceUSD: Nullable<string>;
  strategicBonusApy: Nullable<string>;
};

export type SubsquidAssetSnapshotEntity = SubsquidAssetSnapshotBaseEntity & {
  asset: SubsquidAssetBaseEntity;
};

export type SubsquidAssetEntity = SubsquidAssetBaseEntity & {
  data: SubsquidAssetSnapshotBaseEntity[];
  poolXYK: SubsquidPoolXYKBaseEntity[];
};

export type SubsquidPoolXYKEntity = SubsquidPoolXYKBaseEntity & {
  baseAsset: SubsquidAssetBaseEntity;
  targetAsset: SubsquidAssetBaseEntity;
};

export type SubsquidNetworkStatsEntity = {
  id: string;
  totalFees: CodecString;
  totalAccounts: number;
  totalTransactions: number;
  totalBridgeIncomingTransactions: number;
  totalBridgeOutgoingTransactions: number;
};

export type SubsquidNetworkSnapshotEntity = {
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

export type SubsquidReferrerRewardEntity = {
  id: string;
  referral: string;
  referrer: string;
  updated: number;
  amount: CodecString;
};
/* eslint-enable camelcase */

export type SubsquidHistoryElementError = {
  moduleErrorId: number;
  moduleErrorIndex: number;
};

export type SubsquidHistoryElementExecution = {
  success: boolean;
  error?: SubsquidHistoryElementError;
};

export type SubsquidHistoryElementSwap = {
  baseAssetAmount: string;
  baseAssetId: string;
  liquidityProviderFee: string;
  selectedMarket: string;
  targetAssetAmount: string;
  targetAssetId: string;
};

export type SubsquidHistoryElementSwapTransfer = SubsquidHistoryElementSwap & {
  to: string;
};

export type SubsquidSwapTransferBatchTransferParam = {
  from: string;
  to: string;
  amount: string;
  assetId: string;
};

type SubsquidSwapTransferBatchExchangeParam = {
  from: string;
  to: string;
  amount: string;
  assetId: string;
};

export type SubsquidHistoryElementSwapTransferBatch = {
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

  transfers: Array<SubsquidSwapTransferBatchTransferParam>;
  exchanges: Array<SubsquidSwapTransferBatchExchangeParam>;
};

export type SubsquidHistoryElementTransfer = {
  amount: string;
  assetId: string;
  from: string;
  to: string;
};

export type SubsquidHistoryElementLiquidityOperation = {
  baseAssetAmount: string;
  baseAssetId: string;
  targetAssetAmount: string;
  targetAssetId: string;
  type: string;
};

export type SubsquidHistoryElementAssetRegistration = {
  assetId: string;
};

export type SubsquidHistoryElementDemeterFarming = {
  amount: string;
  assetId: string;
  isFarm: boolean;
  rewardAssetId?: string;
  baseAssetId?: string;
};

export type SubsquidClaimedRewardItem = {
  assetId: string;
  amount: string;
};

export type SubsquidHistoryElementRewardsClaim = Nullable<SubsquidClaimedRewardItem[]>;

export type SubsquidUtilityBatchCall = {
  data: {
    [key: string]: string | number;
  };
  hash: string;
  callId: string;
  module: string;
  method: string;
};

export type SubsquidExtrinsicEvent = {
  method: string;
  section: string;
  data: any[];
};

export type SubsquidHistoryElementCalls = SubsquidUtilityBatchCall[];

export type SubsquidHistoryElementEthBridgeOutgoing = {
  amount: string;
  assetId: string;
  sidechainAddress: string;
  requestHash?: string;
};

export type SubsquidHistoryElementEthBridgeIncoming = {
  amount: string;
  assetId: string;
  requestHash: string;
  to: string;
};

export type SubsquidReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type SubsquidReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type SubsquidHistoryElement = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: SubsquidHistoryElementExecution;
  timestamp: number;
  data: Nullable<
    | SubsquidHistoryElementSwap
    | SubsquidHistoryElementSwapTransfer
    | SubsquidHistoryElementTransfer
    | SubsquidHistoryElementLiquidityOperation
    | SubsquidHistoryElementAssetRegistration
    | SubsquidReferralSetReferrer
    | SubsquidReferrerReserve
    | SubsquidHistoryElementEthBridgeOutgoing
    | SubsquidHistoryElementEthBridgeIncoming
    | SubsquidHistoryElementRewardsClaim
    | SubsquidHistoryElementDemeterFarming
    | SubsquidHistoryElementSwapTransferBatch
  >;
  calls: SubsquidHistoryElementCalls;
};

export type SubsquidAccountEntity = {
  id: string;
  latestHistoryElement: SubsquidHistoryElement;
};
