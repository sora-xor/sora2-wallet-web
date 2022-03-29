import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import type { CursorPagination } from '../../types/history';

export type TransactionsState = {
  history: AccountHistory<HistoryItem>;
  externalHistory: AccountHistory<HistoryItem>;
  externalHistoryTotal: number;
  externalHistoryPagination: Nullable<CursorPagination>;
  activeTxsIds: Array<string>;
  updateActiveTxsId: Nullable<NodeJS.Timeout | number>;
  selectedTxId: Nullable<string>;
};
