import { defineMutations } from 'direct-vuex';

import { api } from '../../api';

import type { EthBridgeUpdateHistory } from '../../consts';
import type { PageInfo } from '../../services/indexer/subsquid/types';
import type { TransactionsState } from './types';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

const mutations = defineMutations<TransactionsState>()({
  setActiveTxsSubscription(state, subscription: NodeJS.Timeout | number): void {
    state.updateActiveTxsId = subscription;
  },
  resetActiveTxs(state): void {
    if (state.updateActiveTxsId) {
      clearInterval(state.updateActiveTxsId as number);
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
  resetTxDetailsId(state): void {
    state.selectedTxId = null;
  },
  getHistory(state): void {
    // show eth bridge history, if update fn exists
    const ethBridgeHistory = state.updateEthBridgeHistory ? api.bridge.history : {};
    // increasing performance: Object.freeze - to remove vue reactivity from 'history' attributes
    state.history = Object.freeze({ ...api.history, ...ethBridgeHistory });
  },
  setEthBridgeHistoryUpdateFn(state, updateEthBridgeHistory: EthBridgeUpdateHistory): void {
    state.updateEthBridgeHistory = updateEthBridgeHistory;
  },
  setExternalHistory(state, history: AccountHistory<HistoryItem>): void {
    state.externalHistory = Object.freeze(history);
  },
  setExternalHistoryTotal(state, total = 0): void {
    state.externalHistoryTotal = total;
  },
  setExternalHistoryPagination(state, pageInfo: Nullable<PageInfo>): void {
    state.externalHistoryPagination = pageInfo;
  },
  resetExternalHistory(state): void {
    state.externalHistory = {};
    state.externalHistoryTotal = 0;
    state.externalHistoryPagination = null;
  },
  setExternalHistorySubscription(state, subscription: VoidFunction): void {
    state.externalHistorySubscription = subscription;
  },
  resetExternalHistorySubscription(state): void {
    if (state.externalHistorySubscription) {
      state.externalHistorySubscription();
    }
    state.externalHistorySubscription = null;
  },
  setConfirmTxDialogVisibility(state, visibility: boolean): void {
    state.isConfirmTxDialogVisible = visibility;
  },
  approveTxViaConfirmTxDialog(state): void {
    state.isTxApprovedViaConfirmTxDialog = true;
  },
  resetTxApprovedViaConfirmTxDialog(state): void {
    state.isTxApprovedViaConfirmTxDialog = false;
  },
});

export default mutations;
