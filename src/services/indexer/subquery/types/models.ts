import type { CodecString } from '@sora-substrate/util';

import { ConnectionQueryResponseData, SnapshotTypes } from '../../types';

// Subquery Models
/* eslint-disable camelcase */
export type SubqueryAssetBaseEntity = {
  id: string;
  priceUSD: string;
  supply: string;
  liquidity: string;
  // subscription payload fields
  price_u_s_d?: Nullable<string>;
};

export type SubqueryAssetSnapshotBaseEntity = {
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

export type SubqueryPoolXYKBaseEntity = {
  id: string;
  baseAssetId: string;
  targetAssetId: string;
  baseAssetReserves: CodecString;
  targetAssetReserves: CodecString;
  multiplier: number;
  priceUSD: Nullable<string>;
  strategicBonusApy: Nullable<string>;
  // subscription payload fields
  price_u_s_d?: Nullable<string>;
  strategic_bonus_apy?: Nullable<string>;
};

export type SubqueryAssetSnapshotEntity = SubqueryAssetSnapshotBaseEntity & {
  asset: SubqueryAssetBaseEntity;
};

export type SubqueryAssetEntity = SubqueryAssetBaseEntity & {
  data: ConnectionQueryResponseData<SubqueryAssetSnapshotBaseEntity>;
  poolXYK: ConnectionQueryResponseData<SubqueryPoolXYKBaseEntity>;
};

export type SubqueryAccountEntity = {
  id: string;
  latest_history_element_id: string;
};

export type SubqueryPoolXYKEntity = SubqueryPoolXYKBaseEntity & {
  baseAsset: SubqueryAssetBaseEntity;
  targetAsset: SubqueryAssetBaseEntity;
};

export type SubqueryNetworkStatsEntity = {
  id: string;
  totalFees: CodecString;
  totalAccounts: number;
  totalTransactions: number;
  totalBridgeIncomingTransactions: number;
  totalBridgeOutgoingTransactions: number;
};

export type SubqueryNetworkSnapshotEntity = {
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

export type SubqueryReferrerRewardEntity = {
  id: string;
  referral: string;
  referrer: string;
  updated: number;
  amount: CodecString;
};
/* eslint-enable camelcase */

export type SubqueryHistoryElementError = {
  moduleErrorId: number;
  moduleErrorIndex: number;
};

export type SubqueryHistoryElementExecution = {
  success: boolean;
  error?: SubqueryHistoryElementError;
};

export type SubqueryHistoryElementSwap = {
  baseAssetAmount: string;
  baseAssetId: string;
  liquidityProviderFee: string;
  selectedMarket: string;
  targetAssetAmount: string;
  targetAssetId: string;
};

export type SubqueryHistoryElementSwapTransfer = SubqueryHistoryElementSwap & {
  to: string;
};

export type SubqueryHistoryElementTransfer = {
  amount: string;
  assetId: string;
  from: string;
  to: string;
};

export type SubqueryHistoryElementLiquidityOperation = {
  baseAssetAmount: string;
  baseAssetId: string;
  targetAssetAmount: string;
  targetAssetId: string;
  type: string;
};

export type SubqueryHistoryElementAssetRegistration = {
  assetId: string;
};

export type SubqueryHistoryElementDemeterFarming = {
  amount: string;
  assetId: string;
  isFarm: boolean;
  rewardAssetId?: string;
  baseAssetId?: string;
};

export type SubqueryClaimedRewardItem = {
  assetId: string;
  amount: string;
};

export type SubqueryHistoryElementRewardsClaim = Nullable<SubqueryClaimedRewardItem[]>;

export type SubqueryUtilityBatchCall = {
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

export type SubqueryExtrinsicEvent = {
  method: string;
  section: string;
  data: any[];
};

export type SubqueryHistoryElementUtilityBatchAll = SubqueryUtilityBatchCall[];

export type SubqueryHistoryElementEthBridgeOutgoing = {
  amount: string;
  assetId: string;
  sidechainAddress: string;
  requestHash?: string;
};

export type SubqueryHistoryElementEthBridgeIncoming = {
  amount: string;
  assetId: string;
  requestHash: string;
  to: string;
};

export type SubqueryReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type SubqueryReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type SubqueryHistoryElement = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: SubqueryHistoryElementExecution;
  timestamp: number;
  data: Nullable<
    | SubqueryHistoryElementSwap
    | SubqueryHistoryElementSwapTransfer
    | SubqueryHistoryElementTransfer
    | SubqueryHistoryElementLiquidityOperation
    | SubqueryHistoryElementAssetRegistration
    | SubqueryHistoryElementUtilityBatchAll
    | SubqueryReferralSetReferrer
    | SubqueryReferrerReserve
    | SubqueryHistoryElementEthBridgeOutgoing
    | SubqueryHistoryElementEthBridgeIncoming
    | SubqueryHistoryElementRewardsClaim
    | SubqueryHistoryElementDemeterFarming
  >;
};
