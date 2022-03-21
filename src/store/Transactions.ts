import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import { TransactionStatus } from '@sora-substrate/util';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../api';
import { delay } from '../util';
import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery';
import { historyElementsFilter } from '../services/subquery/queries/historyElements';
import type { CursorPagination, ExternalHistoryParams } from '../types/history';

const BLOCK_PRODUCE_TIME = 6 * 1000;
const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2 * 1000;

const types = flow(
  flatMap((x) => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET_ACTIVE_TRANSACTIONS',
    'ADD_ACTIVE_TRANSACTION',
    'REMOVE_ACTIVE_TRANSACTION',
    'SET_TRANSACTION_DETAILS_ID',
    'SET_HISTORY',
    'SET_EXTERNAL_HISTORY',
    'SET_EXTERNAL_HISTORY_TOTAL',
    'SET_EXTERNAL_HISTORY_PAGINATION',
  ]),
  map((x) => [x, x]),
  fromPairs
)([]);

type TransactionsState = {
  history: AccountHistory<HistoryItem>;
  externalHistory: AccountHistory<HistoryItem>;
  externalHistoryTotal: number;
  externalHistoryPagination: Nullable<CursorPagination>;
  activeTransactionsIds: Array<string>;
  updateActiveTransactionsId: Nullable<NodeJS.Timeout>;
  selectedTransactionId: Nullable<string>;
};

function initialState(): TransactionsState {
  return {
    history: {}, // history items what not synced with subquery
    externalHistory: {},
    externalHistoryTotal: 0,
    externalHistoryPagination: null,
    activeTransactionsIds: [],
    updateActiveTransactionsId: null,
    selectedTransactionId: null,
  };
}

const state = initialState();

const getters = {
  history(state: TransactionsState): AccountHistory<HistoryItem> {
    return state.history;
  },
  externalHistory(state: TransactionsState): AccountHistory<HistoryItem> {
    return state.externalHistory;
  },
  externalHistoryTotal(state: TransactionsState): number {
    return state.externalHistoryTotal;
  },
  activeTransactions(state: TransactionsState): Array<HistoryItem> {
    return state.activeTransactionsIds.reduce((buffer: Array<HistoryItem>, id: string) => {
      if (id in state.history) {
        buffer.push(state.history[id]);
      }
      return buffer;
    }, []);
  },
  firstReadyTransaction(state: TransactionsState, getters) {
    return getters.activeTransactions.find((t: HistoryItem) =>
      [TransactionStatus.InBlock, TransactionStatus.Finalized, TransactionStatus.Error].includes(
        t.status as TransactionStatus
      )
    );
  },
  selectedTransaction(state: TransactionsState): Nullable<HistoryItem> {
    if (!state.selectedTransactionId) return null;

    return state.history[state.selectedTransactionId] || state.externalHistory[state.selectedTransactionId];
  },
};

const mutations = {
  [types.RESET_ACTIVE_TRANSACTIONS](state: TransactionsState) {
    if (state.updateActiveTransactionsId) {
      clearInterval(state.updateActiveTransactionsId);
    }
    state.activeTransactionsIds = [];
  },

  [types.ADD_ACTIVE_TRANSACTION](state: TransactionsState, id: string) {
    state.activeTransactionsIds = [...new Set([...state.activeTransactionsIds, id])];
  },

  [types.REMOVE_ACTIVE_TRANSACTION](state: TransactionsState, ids: string[]) {
    state.activeTransactionsIds = state.activeTransactionsIds.filter((txId) => !ids.includes(txId));
  },

  [types.SET_TRANSACTION_DETAILS_ID](state: TransactionsState, id: string) {
    state.selectedTransactionId = id;
  },

  [types.SET_HISTORY](state: TransactionsState, history: AccountHistory<HistoryItem>) {
    // increasing performance: Object.freeze - to remove vue reactivity from 'history' attributes
    state.history = Object.freeze(history);
  },

  [types.SET_EXTERNAL_HISTORY](state: TransactionsState, history: AccountHistory<HistoryItem>) {
    // increasing performance: Object.freeze - to remove vue reactivity from 'history' attributes
    state.externalHistory = Object.freeze(history);
  },

  [types.SET_EXTERNAL_HISTORY_TOTAL](state: TransactionsState, count: number) {
    state.externalHistoryTotal = count;
  },

  [types.SET_EXTERNAL_HISTORY_PAGINATION](state: TransactionsState, pageInfo: Nullable<CursorPagination>) {
    state.externalHistoryPagination = pageInfo;
  },
};

const actions = {
  addActiveTransaction({ commit }, id: string) {
    commit(types.ADD_ACTIVE_TRANSACTION, id);
  },
  removeActiveTransactions({ commit }, ids: string[]) {
    commit(types.REMOVE_ACTIVE_TRANSACTION, ids);
  },
  // Should be used once in a root of the project
  trackActiveTransactions({ commit, dispatch, state }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS);

    state.updateActiveTransactionsId = setInterval(async () => {
      if (state.activeTransactionsIds.length) {
        await dispatch('getAccountHistory');
      }
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL);

    dispatch('restorePendingTransactions');
  },
  resetActiveTransactions({ commit }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS);
  },
  getTransactionDetails({ commit }, id: string) {
    commit(types.SET_TRANSACTION_DETAILS_ID, id);
  },
  getAccountHistory({ commit }) {
    commit(types.SET_HISTORY, api.history);
  },
  async clearAccountHistory({ dispatch }, assetAddress?: string) {
    api.clearHistory(assetAddress);
    await dispatch('getAccountHistory');
  },
  resetExternalHistory({ commit }) {
    commit(types.SET_EXTERNAL_HISTORY, {});
    commit(types.SET_EXTERNAL_HISTORY_TOTAL, 0);
    commit(types.SET_EXTERNAL_HISTORY_PAGINATION, null);
  },

  /**
   * Clear history items from accountStorage & from activeTransactions
   */
  removeHistoryByIds({ dispatch }, ids: string[]) {
    dispatch('removeActiveTransactions', ids);
    api.removeHistory(...ids);
  },

  /**
   * Clear history items from accountStorage, what exists in explorer
   * Getting only the IDs & timestamp of elements whose start time is greater than api.historySyncTimestamp
   */
  async clearSyncedAccountHistory({ dispatch }, { address, assetAddress }: { address: string; assetAddress?: string }) {
    const operations = SubqueryDataParserService.supportedOperations;
    const timestamp = api.historySyncTimestamp || 0;
    const filter = historyElementsFilter({ address, assetAddress, timestamp, operations });
    const variables = { filter, idsOnly: true };
    const removeHistoryIds: Array<string> = [];
    const unsyncedHistory = api.history;
    try {
      const { edges } = await SubqueryExplorerService.getAccountTransactions(variables);

      if (edges.length) {
        api.historySyncTimestamp = +edges[0].node.timestamp;

        for (const edge of edges) {
          const historyId = edge.node.id;

          if (historyId in unsyncedHistory) {
            removeHistoryIds.push(historyId);
          }
        }

        if (removeHistoryIds.length) {
          dispatch('removeHistoryByIds', removeHistoryIds);
        }
      }
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * Get history items from explorer, already filtered
   */
  async getExternalHistory(
    { commit, dispatch, state: { externalHistoryPagination: pagination, externalHistory, history } },
    {
      next = true,
      address = '',
      assetAddress = '',
      pageAmount = 8,
      query: { search = '', operationNames = [], assetsAddresses = [] } = {},
    }: ExternalHistoryParams = {}
  ): Promise<void> {
    if (pagination && ((next && !pagination.hasNextPage) || (!next && !pagination.hasPreviousPage))) return;

    const operations = SubqueryDataParserService.supportedOperations;
    const filter = historyElementsFilter({
      address,
      assetAddress,
      operations,
      query: { search, operationNames, assetsAddresses },
    });
    const cursor = {
      [next ? 'after' : 'before']: pagination ? (next ? pagination.endCursor : pagination.startCursor) || '' : '',
    };

    const variables = {
      filter,
      first: pageAmount,
      ...cursor,
    };

    try {
      const { edges, pageInfo, totalCount } = await SubqueryExplorerService.getAccountTransactions(variables);
      const buffer = {};
      const removeHistoryIds: Array<string> = [];

      if (edges.length) {
        for (const edge of edges) {
          const transaction = edge.node;
          const { id } = transaction;

          if (!(id in externalHistory)) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

            if (historyItem) {
              buffer[id] = historyItem;
            }
          }

          if (id in history) {
            removeHistoryIds.push(id);
          }
        }

        if (removeHistoryIds.length) {
          dispatch('removeHistoryByIds', removeHistoryIds);
        }
      }

      commit(types.SET_EXTERNAL_HISTORY, { ...externalHistory, ...buffer });
      commit(types.SET_EXTERNAL_HISTORY_TOTAL, totalCount);
      commit(types.SET_EXTERNAL_HISTORY_PAGINATION, pageInfo);
    } catch (error) {
      console.error(error);
    }
  },

  async restorePendingTransactions({ getters, dispatch, state }) {
    // if tracking is disabled, return
    if (state.updateActiveTransactionsId === null) return;

    const now = Date.now();
    // difference in time between last block & finilized block (ideal)
    const delta = 3 * BLOCK_PRODUCE_TIME;
    // find transactions, which blocks should be produced
    const txs: HistoryItem[] = [...getters.activeTransactions].filter(
      (item: HistoryItem) => now - (item.startTime as number) > delta
    );

    if (txs.length) {
      try {
        const ids = txs.map((tx) => tx.id as string);
        const variables = { filter: { id: { in: ids } } };
        const { edges } = await SubqueryExplorerService.getAccountTransactions(variables);

        if (edges.length) {
          for (const edge of edges) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(edge.node);

            if (historyItem && (historyItem.id as string) in api.history) {
              api.saveHistory(historyItem);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    await delay(BLOCK_PRODUCE_TIME);
    dispatch('restorePendingTransactions');
  },
};

export default {
  types,
  state,
  getters,
  mutations,
  actions,
};
