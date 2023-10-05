import {
  AssetSnapshotBaseEntity,
  ConnectionQueryResponseData,
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

export type SubqueryAssetSnapshotEntity = AssetSnapshotBaseEntity & {
  asset: SubqueryAssetBaseEntity;
};

export type SubqueryAssetEntity = SubqueryAssetBaseEntity & {
  data: ConnectionQueryResponseData<AssetSnapshotBaseEntity>;
  poolXYK: ConnectionQueryResponseData<SubqueryPoolXYKBaseEntity>;
};

export type SubqueryPoolXYKEntity = SubqueryPoolXYKBaseEntity & {
  baseAsset: SubqueryAssetBaseEntity;
  targetAsset: SubqueryAssetBaseEntity;
};

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

export type SubqueryHistoryElementUtilityBatchAll = SubqueryUtilityBatchCall[];

export type SubqueryHistoryElementData = Nullable<
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
  | SubqueryHistoryElementUtilityBatchAll
>;

export type SubqueryHistoryElement = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: HistoryElementExecution;
  timestamp: number;
  data: SubqueryHistoryElementData;
};

export type SubqueryAccountEntity = {
  id: string;
  latest_history_element_id: string;
};
/* eslint-enable camelcase */
