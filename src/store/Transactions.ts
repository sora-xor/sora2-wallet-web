import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import { History, TransactionStatus } from '@sora-substrate/util';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../api';
import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery';
import { historyElementsFilter } from '../services/subquery/queries/historyElements';
import type { CursorPagination } from '../types/history';

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2 * 1000;

const types = flow(
  flatMap((x) => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET_ACTIVE_TRANSACTIONS',
    'ADD_ACTIVE_TRANSACTION',
    'REMOVE_ACTIVE_TRANSACTION',
    'SET_TRANSACTION_DETAILS_ID',
    'GET_ACTIVITY',
    'SET_EXTERNAL_ACTIVITY',
    'SET_EXTERNAL_ACTIVITY_TOTAL',
    'SET_EXTERNAL_ACTIVITY_PAGINATION',
  ]),
  map((x) => [x, x]),
  fromPairs
)([]);

type TransactionsState = {
  activity: AccountHistory<HistoryItem>;
  externalActivity: AccountHistory<HistoryItem>;
  externalActivityTotal: number;
  externalActivityPagination: Nullable<CursorPagination>;
  activeTransactionsIds: Array<string>;
  updateActiveTransactionsId: Nullable<NodeJS.Timeout>;
  selectedTransactionId: Nullable<string>;
};

function initialState(): TransactionsState {
  return {
    activity: {}, // history items what not synced with subquery
    externalActivity: {},
    externalActivityTotal: 0,
    externalActivityPagination: null,
    activeTransactionsIds: [],
    updateActiveTransactionsId: null,
    selectedTransactionId: null,
  };
}

const state = initialState();

const getters = {
  activity(state: TransactionsState): AccountHistory<HistoryItem> {
    return state.activity;
  },
  externalActivity(state: TransactionsState): AccountHistory<HistoryItem> {
    return state.externalActivity;
  },
  externalActivityTotal(state: TransactionsState): number {
    return state.externalActivityTotal;
  },
  activeTransactions(state: TransactionsState): Array<HistoryItem> {
    return state.activeTransactionsIds.reduce((buffer: Array<HistoryItem>, id: string) => {
      if (id in state.activity) {
        buffer.push(state.activity[id]);
      }
      return buffer;
    }, []);
  },
  firstReadyTransaction(state: TransactionsState, getters) {
    return getters.activeTransactions.find((t) =>
      [TransactionStatus.Finalized, TransactionStatus.Error].includes(t.status as TransactionStatus)
    );
  },
  selectedTransaction(state: TransactionsState): Nullable<History> {
    if (!state.selectedTransactionId) return null;

    return state.activity[state.selectedTransactionId] || state.externalActivity[state.selectedTransactionId];
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

  [types.GET_ACTIVITY](state: TransactionsState, activity: AccountHistory<HistoryItem>) {
    // increasing performance: Object.freeze - to remove vue reactivity from 'activity' attributes
    state.activity = Object.freeze(activity);
  },

  [types.SET_EXTERNAL_ACTIVITY](state: TransactionsState, activity: AccountHistory<HistoryItem>) {
    // increasing performance: Object.freeze - to remove vue reactivity from 'activity' attributes
    state.externalActivity = Object.freeze(activity);
  },

  [types.SET_EXTERNAL_ACTIVITY_TOTAL](state: TransactionsState, count: number) {
    state.externalActivityTotal = count;
  },

  [types.SET_EXTERNAL_ACTIVITY_PAGINATION](state: TransactionsState, pageInfo: Nullable<CursorPagination>) {
    state.externalActivityPagination = pageInfo;
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
        dispatch('getAccountActivity');
      }
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL);
  },
  resetActiveTransactions({ commit }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS);
  },
  getTransactionDetails({ commit }, id: string) {
    commit(types.SET_TRANSACTION_DETAILS_ID, id);
  },
  getAccountActivity({ commit }) {
    commit(types.GET_ACTIVITY, api.history);
  },
  resetExternalActivity({ commit }) {
    commit(types.SET_EXTERNAL_ACTIVITY, {});
    commit(types.SET_EXTERNAL_ACTIVITY_TOTAL, 0);
    commit(types.SET_EXTERNAL_ACTIVITY_PAGINATION, null);
  },

  /**
   * Clear history items from accountStorage, what exists in explorer
   */
  async clearSyncedAccountActivity(
    { dispatch, state },
    { address, assetAddress }: { address: string; assetAddress?: string }
  ) {
    const timestamp = api.historySyncTimestamp || 0;
    const filter = historyElementsFilter(address, { assetAddress, timestamp });
    const variables = { filter };
    const removeHistoryIds: Array<string> = [];
    try {
      const { edges } = await SubqueryExplorerService.getAccountTransactions(variables, { data: false });

      if (edges.length) {
        for (const edge of edges) {
          const historyId = edge.node.id;

          if (historyId in state.activity) {
            removeHistoryIds.push(historyId);
          }
        }

        if (removeHistoryIds.length) {
          api.removeHistory(...removeHistoryIds);
          await dispatch('getAccountActivity');
        }
      }

      api.historySyncTimestamp = Math.round(Date.now() / 1000);
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * Get history from explorer, already filtered
   */
  async getExternalActivity(
    { commit, state: { externalActivityPagination: pagination, externalActivity, activity } },
    {
      next = true,
      address = '',
      assetAddress = '',
      pageAmount = 8,
      query: { search = '', operations = [], assetsAddresses = [] } = {},
    } = {}
  ): Promise<void> {
    if (pagination && ((next && !pagination.hasNextPage) || (!next && !pagination.hasPreviousPage))) return;

    const filter = historyElementsFilter(address, { assetAddress, query: { search, operations, assetsAddresses } });
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

          if (!(id in externalActivity)) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

            if (historyItem) {
              buffer[id] = historyItem;
            }
          }

          if (id in activity) {
            removeHistoryIds.push(id);
          }
        }

        if (removeHistoryIds.length) {
          api.removeHistory(...removeHistoryIds);
        }
      }

      commit(types.SET_EXTERNAL_ACTIVITY, { ...externalActivity, ...buffer });
      commit(types.SET_EXTERNAL_ACTIVITY_TOTAL, totalCount);
      commit(types.SET_EXTERNAL_ACTIVITY_PAGINATION, pageInfo);
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
