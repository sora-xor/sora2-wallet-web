import {
  AssetBaseEntity,
  AssetSnapshotBaseEntity,
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
  PoolXYKBaseEntity,
  ReferralSetReferrer,
  ReferrerReserve,
} from '../../types';

// Subsquid Models

// with connection
export type SubsquidAssetEntity = AssetBaseEntity & {
  data: AssetSnapshotBaseEntity[];
  poolXYK: PoolXYKBaseEntity[];
};
// with connection
export type SubsquidPoolXYKEntity = PoolXYKBaseEntity & {
  baseAsset: AssetBaseEntity;
  targetAsset: AssetBaseEntity;
};

export type SubsquidUtilityBatchCall = {
  data: {
    [key: string]: string | number;
  };
  hash: string;
  callId: string;
  module: string;
  method: string;
};

export type SubsquidHistoryElementData = Nullable<
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
  data: SubsquidHistoryElementData;
  calls: SubsquidHistoryElementCalls;
};

export type SubsquidAccountEntityMutation = {
  id: string;
  latestHistoryElement: SubsquidHistoryElement;
};
