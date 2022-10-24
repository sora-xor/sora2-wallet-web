import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import type { EthBridgeUpdateHistory } from '../../consts';
import type { PageInfo } from '../../services/subquery/types';

export type TransactionsState = {
  history: AccountHistory<HistoryItem>;
  externalHistory: AccountHistory<HistoryItem>;
  externalHistoryTotal: number;
  externalHistoryPagination: Nullable<PageInfo>;
  externalHistorySubscription: Nullable<VoidFunction>;
  activeTxsIds: Array<string>;
  updateActiveTxsId: Nullable<NodeJS.Timeout | number>;
  selectedTxId: Nullable<string>;
  updateEthBridgeHistory: Nullable<EthBridgeUpdateHistory>;
};
