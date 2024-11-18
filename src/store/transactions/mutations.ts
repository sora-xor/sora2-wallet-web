import { defineMutations } from 'direct-vuex';

import { api } from '../../api';
import { settingsStorage } from '../../util/storage';

import type { TransactionsState } from './types';
import type { AccountHistory, HistoryItem } from '@sora-substrate/sdk';

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
  async getHistory(state): Promise<void> {
    const mstAddress = api.mst.getMstAddress();
    await api.mst.subscribeOnPendingTxs(mstAddress);
    // show eth bridge history, if update fn exists
    const ethBridgeHistory = state.updateEthBridgeHistory ? api.bridgeProxy.eth.history : {};
    // increasing performance: Object.freeze - to remove vue reactivity from 'history' attributes
    state.history = Object.freeze({ ...api.history, ...ethBridgeHistory });
  },
  setExternalHistory(state, history: AccountHistory<HistoryItem>): void {
    state.externalHistory = Object.freeze(history);
  },
  setExternalHistoryUpdates(state, history: AccountHistory<HistoryItem>): void {
    state.externalHistoryUpdates = Object.freeze(history);
  },
  saveExternalHistoryUpdates(state, flag: boolean) {
    state.saveExternalHistoryUpdates = flag;
  },
  setExternalHistoryTotal(state, total = 0): void {
    state.externalHistoryTotal = total;
  },
  resetExternalHistory(state): void {
    state.externalHistory = {};
    state.externalHistoryUpdates = {};
    state.externalHistoryTotal = 0;
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
  setConfirmTxDialogDisabled(state, flag: boolean): void {
    state.isConfirmTxDialogDisabled = flag;
    settingsStorage.set('confirmTxDialogDisabled', flag);
  },
  setSignTxDialogDisabled(state, flag: boolean): void {
    state.isSignTxDialogDisabled = flag;
    settingsStorage.set('signTxDialogDisabled', flag);
  },
  setSignTxDialogVisibility(state, visibility: boolean): void {
    state.isSignTxDialogVisible = visibility;
  },
});

export default mutations;
