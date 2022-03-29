import { defineMutations } from 'direct-vuex';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../../api';
import type { TransactionsState } from './types';
import type { CursorPagination } from '../../types/history';

const mutations = defineMutations<TransactionsState>()({
  setActiveTxsSubscription(state, subscription: NodeJS.Timeout): void {
    state.updateActiveTxsId = subscription;
  },
  resetActiveTxs(state): void {
    if (state.updateActiveTxsId) {
      clearInterval(state.updateActiveTxsId);
    }
    state.activeTxsIds = [];
  },
  addActiveTx(state, id: string): void {
    state.activeTxsIds = [...new Set([...state.activeTxsIds, id])];
  },
  removeActiveTxs(state, ids: Array<string>): void {
    state.activeTxsIds = state.activeTxsIds.filter((txId) => !ids.includes(txId));
  },
  removeHistoryByIds(state, ids: Array<string>): void {
    state.activeTxsIds = state.activeTxsIds.filter((txId) => !ids.includes(txId));
    api.removeHistory(...ids);
  },
  setTxDetailsId(state, id: string): void {
    state.selectedTxId = id;
  },
  getHistory(state): void {
    // increasing performance: Object.freeze - to remove vue reactivity from 'history' attributes
    state.history = Object.freeze(api.history);
  },
  setExternalHistory(state, history: AccountHistory<HistoryItem>): void {
    state.externalHistory = Object.freeze(history);
  },
  setExternalHistoryTotal(state, total: number): void {
    state.externalHistoryTotal = total;
  },
  setExternalHistoryPagination(state, pageInfo: Nullable<CursorPagination>): void {
    state.externalHistoryPagination = pageInfo;
  },
  resetExternalHistory(state): void {
    state.externalHistory = {};
    state.externalHistoryTotal = 0;
    state.externalHistoryPagination = null;
  },
});

export default mutations;
