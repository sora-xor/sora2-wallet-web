import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import { TransactionStatus } from '@sora-substrate/util';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../api';
import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery';
import { historyElementsFilter } from '../services/subquery/queries/historyElements';
import type { CursorPagination, ExternalHistoryParams } from '../types/history';

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
    return getters.activeTransactions.find((t) =>
      [TransactionStatus.Finalized, TransactionStatus.Error].includes(t.status as TransactionStatus)
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

  [types.REMOVE_ACTIVE_TRANSACTION](state: TransactionsState, id: string) {
    state.activeTransactionsIds = state.activeTransactionsIds.filter((txId) => txId !== id);
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
  removeActiveTransaction({ commit }, id: string) {
    commit(types.REMOVE_ACTIVE_TRANSACTION, id);
  },
  // Should be used once in a root of the project
  trackActiveTransactions({ commit, dispatch, state }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS);
    state.updateActiveTransactionsId = setInterval(() => {
      if (state.activeTransactionsIds.length) {
        dispatch('getAccountHistory');
      }
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL);
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
   * Clear history items from accountStorage, what exists in explorer
   * Getting only the IDs & timestamp of elements whose start time is greater than api.historySyncTimestamp
   */
  async clearSyncedAccountHistory(
    { dispatch, state },
    { address, assetAddress }: { address: string; assetAddress?: string }
  ) {
    const operations = SubqueryDataParserService.supportedOperations;
    const timestamp = api.historySyncTimestamp || 0;
    const filter = historyElementsFilter({ address, assetAddress, timestamp, operations });
    const variables = { filter, idsOnly: true };
    const removeHistoryIds: Array<string> = [];
    try {
      const { edges } = await SubqueryExplorerService.getAccountTransactions(variables);

      if (edges.length) {
        api.historySyncTimestamp = +edges[0].node.timestamp;

        for (const edge of edges) {
          const historyId = edge.node.id;

          if (historyId in state.history) {
            removeHistoryIds.push(historyId);
          }
        }

        if (removeHistoryIds.length) {
          api.removeHistory(...removeHistoryIds);
          await dispatch('getAccountHistory');
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
    { commit, state: { externalHistoryPagination: pagination, externalHistory, history } },
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
          api.removeHistory(...removeHistoryIds);
        }
      }

      commit(types.SET_EXTERNAL_HISTORY, { ...externalHistory, ...buffer });
      commit(types.SET_EXTERNAL_HISTORY_TOTAL, totalCount);
      commit(types.SET_EXTERNAL_HISTORY_PAGINATION, pageInfo);
    } catch (error) {
      console.error(error);
    }
  },
};

export default {
  types,
  state,
  getters,
  mutations,
  actions,
};
