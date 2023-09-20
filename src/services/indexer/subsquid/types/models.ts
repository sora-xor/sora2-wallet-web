import {
  AssetSnapshotBaseEntity,
  ClaimedRewardItem,
  HistoryElementAssetRegistration,
  HistoryElementDemeterFarming,
  HistoryElementEthBridgeIncoming,
  HistoryElementEthBridgeOutgoing,
  HistoryElementExecution,
  HistoryElementLiquidityOperation,
  HistoryElementRewardsClaim,
  HistoryElementSwap,
  HistoryElementSwapTransfer,
  HistoryElementSwapTransferBatch,
  HistoryElementTransfer,
  ReferralSetReferrer,
  ReferrerReserve,
} from '../../types';

import type { CodecString } from '@sora-substrate/util';

// Subsquid Models

export type SubsquidAssetBaseEntity = {
  id: string;
  priceUSD: string;
  supply: string;
  liquidity: string;
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

export type SubsquidAssetSnapshotEntity = AssetSnapshotBaseEntity & {
  asset: SubsquidAssetBaseEntity;
};

export type SubsquidAssetEntity = SubsquidAssetBaseEntity & {
  data: AssetSnapshotBaseEntity[];
  poolXYK: SubsquidPoolXYKBaseEntity[];
};

export type SubsquidPoolXYKEntity = SubsquidPoolXYKBaseEntity & {
  baseAsset: SubsquidAssetBaseEntity;
  targetAsset: SubsquidAssetBaseEntity;
};

export type SubsquidHistoryElementRewardsClaim = Nullable<ClaimedRewardItem[]>;

export type SubsquidUtilityBatchCall = {
  data: {
    [key: string]: string | number;
  };
  hash: string;
  callId: string;
  module: string;
  method: string;
};

export type SubsquidHistoryElementCalls = SubsquidUtilityBatchCall[];

export type SubsquidHistoryElement = {
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
  calls: SubsquidHistoryElementCalls;
};

export type SubsquidAccountEntity = {
  id: string;
  latestHistoryElement: SubsquidHistoryElement;
};
