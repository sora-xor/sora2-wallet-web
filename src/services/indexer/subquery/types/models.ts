import {
  AccountBaseEntity,
  AssetBaseEntity,
  AssetSnapshotBaseEntity,
  ConnectionQueryResponseData,
  HistoryElementBase,
  PoolXYKBaseEntity,
  OrderBookBaseEntity,
  OrderBookSnapshotBaseEntity,
  OrderBookOrderBaseEntity,
} from '../../types';

// Subquery Models
/* eslint-disable camelcase */

// with derived fields
export type SubqueryAccountBaseEntity = AccountBaseEntity & {
  latestHistoryElementId: string;
};
export type SubqueryAccountEntity = SubqueryAccountBaseEntity & {
  latestHistoryElement: HistoryElementBase;
};

// with derived fields
export type SubqueryPoolXYKBaseEntity = PoolXYKBaseEntity & {
  baseAssetId: string;
  targetAssetId: string;
};
// with connection
export type SubqueryPoolXYKEntity = SubqueryPoolXYKBaseEntity & {
  baseAsset: AssetBaseEntity;
  targetAsset: AssetBaseEntity;
};

// with derived fields
export type SubqueryOrderBookSnapshotBaseEntity = OrderBookSnapshotBaseEntity & {
  orderBookId: string;
};
// with connection
export type SubqueryOrderBookSnapshotEntity = SubqueryOrderBookSnapshotBaseEntity & {
  orderBook: OrderBookBaseEntity;
};

// with derived fields
export type SubqueryOrderBookBaseEntity = OrderBookBaseEntity & {
  baseAssetId: string; // connection field
  quoteAssetId: string; // connection field
};

// with derived fields
export type SubqueryOrderBookOrderBaseEntity = OrderBookOrderBaseEntity & {
  orderBookId: string;
  accountId: string;
};

// with connection
export type SubqueryOrderBookOrderEntity = SubqueryOrderBookOrderBaseEntity & {
  orderBook: SubqueryOrderBookBaseEntity;
  account: SubqueryAccountBaseEntity;
};

// with connection
export type SubqueryOrderBookEntity = SubqueryOrderBookBaseEntity & {
  baseAsset: AssetBaseEntity;
  quoteAsset: AssetBaseEntity;
  data: ConnectionQueryResponseData<SubqueryOrderBookSnapshotBaseEntity>;
  orders: ConnectionQueryResponseData<SubqueryOrderBookOrderBaseEntity>;
};

// with connection
export type SubqueryAssetEntity = AssetBaseEntity & {
  data: ConnectionQueryResponseData<AssetSnapshotBaseEntity>;
  poolXYK: ConnectionQueryResponseData<SubqueryPoolXYKBaseEntity>;
};

// with derived fields
export type SubqueryAssetSnapshotBaseEntity = AssetSnapshotBaseEntity & {
  assetId: string;
};
// with connection
export type SubqueryAssetSnapshotEntity = SubqueryAssetSnapshotBaseEntity & {
  asset: AssetBaseEntity;
};

export type SubqueryAccountEntityMutation = {
  // subscription payload fields what we need
  id: string;
  latest_history_element_id: string;
};
/* eslint-enable camelcase */
