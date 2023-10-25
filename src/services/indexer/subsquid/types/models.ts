import {
  AssetBaseEntity,
  AssetSnapshotBaseEntity,
  HistoryElementBase,
  HistoryElementDataBase,
  PoolXYKBaseEntity,
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

export type SubsquidHistoryElementCalls = SubsquidUtilityBatchCall[];

export type SubsquidHistoryElement = HistoryElementBase & {
  data: HistoryElementDataBase;
  calls: SubsquidHistoryElementCalls;
};

export type SubsquidAccountEntityMutation = {
  id: string;
  latestHistoryElement: SubsquidHistoryElement;
};
