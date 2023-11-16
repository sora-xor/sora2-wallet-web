import {
  AssetBaseEntity,
  AssetSnapshotBaseEntity,
  ConnectionQueryResponseData,
  HistoryElementBase,
  HistoryElementDataBase,
  PoolXYKBaseEntity,
} from '../../types';

// Subquery Models
/* eslint-disable camelcase */
export type SubqueryPoolXYKBaseEntity = PoolXYKBaseEntity & {
  // derived fields
  baseAssetId: string;
  targetAssetId: string;
};

// with connection
export type SubqueryPoolXYKEntity = SubqueryPoolXYKBaseEntity & {
  baseAsset: AssetBaseEntity;
  targetAsset: AssetBaseEntity;
};

// with connection
export type SubqueryAssetEntity = AssetBaseEntity & {
  data: ConnectionQueryResponseData<AssetSnapshotBaseEntity>;
  poolXYK: ConnectionQueryResponseData<SubqueryPoolXYKBaseEntity>;
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

export type SubqueryHistoryElementData = HistoryElementDataBase | SubqueryHistoryElementUtilityBatchAll;

export type SubqueryHistoryElement = HistoryElementBase & {
  data: SubqueryHistoryElementData;
};

export type SubqueryStreamUpdate = {
  id: string;
  block: number;
  data: string; // stringified JSON
};

export type SubqueryAccountEntityMutation = {
  // subscription payload fields what we need
  id: string;
  latest_history_element_id: string;
};

export type SubqueryAssetEntityMutation = {
  // subscription payload fields what we need
  id: string;
  price_u_s_d?: Nullable<string>;
};

export type SubqueryPoolXYKEntityMutation = {
  // subscription payload fields what we need
  id: string;
  strategic_bonus_apy?: Nullable<string>;
};
/* eslint-enable camelcase */
