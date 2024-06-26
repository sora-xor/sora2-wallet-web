import {
  AccountBaseEntity,
  AssetBaseEntity,
  AssetSnapshotBaseEntity,
  HistoryElement,
  HistoryElementBase,
  PoolXYKBaseEntity,
  OrderBookBaseEntity,
  OrderBookSnapshotBaseEntity,
  OrderBookOrderBaseEntity,
} from '../../types';

// Subsquid Models

// with connection
export type SubsquidAccountEntity = AccountBaseEntity & {
  latestHistoryElement: HistoryElementBase;
};

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

// with connection
export type SubsquidOrderBookEntity = OrderBookBaseEntity & {
  baseAsset: AssetBaseEntity;
  quoteAsset: AssetBaseEntity;
  data: OrderBookSnapshotBaseEntity[];
  orders: OrderBookOrderBaseEntity[];
};

// with connection
export type SubsquidOrderBookSnapshotEntity = OrderBookSnapshotBaseEntity & {
  orderBook: OrderBookBaseEntity;
};

// with connection
export type SubsquidOrderBookOrderEntity = OrderBookOrderBaseEntity & {
  orderBook: OrderBookBaseEntity;
  account: AccountBaseEntity;
};

export type SubsquidAccountEntityMutation = {
  id: string;
  latestHistoryElement: HistoryElement;
};
