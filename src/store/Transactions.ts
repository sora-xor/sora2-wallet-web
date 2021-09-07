import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import { History, TransactionStatus } from '@sora-substrate/util'

import { api } from '../api'

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2 * 1000

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET_ACTIVE_TRANSACTIONS',
    'ADD_ACTIVE_TRANSACTION',
    'REMOVE_ACTIVE_TRANSACTION',
    'UPDATE_ACTIVE_TRANSACTIONS'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

const isValidTransaction = (tx: History) => tx && tx.id !== undefined

type TransactionsState = {
  activeTransactions: Array<History>;
  updateActiveTransactionsId: Nullable<NodeJS.Timeout>;
}

function initialState (): TransactionsState {
  return {
    activeTransactions: [],
    updateActiveTransactionsId: null
  }
}

const state = initialState()

const getters = {
  firstReadyTransaction (state: TransactionsState) {
    return state.activeTransactions.find(t => [TransactionStatus.Finalized, TransactionStatus.Error].includes(t.status as TransactionStatus))
  }
}

const mutations = {
  [types.RESET_ACTIVE_TRANSACTIONS] (state: TransactionsState) {
    if (state.updateActiveTransactionsId) {
      clearInterval(state.updateActiveTransactionsId)
    }
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.ADD_ACTIVE_TRANSACTION] (state: TransactionsState, tx: History) {
    if (!isValidTransaction(tx) || state.activeTransactions.find((t: History) => t.id === tx.id)) {
      return
    }
    state.activeTransactions.push(tx)
  },

  [types.REMOVE_ACTIVE_TRANSACTION] (state: TransactionsState, tx: History) {
    if (!isValidTransaction(tx)) {
      return
    }
    state.activeTransactions = state.activeTransactions.filter((t: History) => t.id !== tx.id)
  },

  [types.UPDATE_ACTIVE_TRANSACTIONS] (state: TransactionsState) {
    if (!api.history.length) {
      return
    }
    const history = api.history

    state.activeTransactions = state.activeTransactions.map(tx => {
      return history.find(item => item.id === tx.id) || tx
    })
  }
}

const actions = {
  addActiveTransaction ({ commit }, tx: History) {
    commit(types.ADD_ACTIVE_TRANSACTION, tx)
  },
  removeActiveTransaction ({ commit }, tx: History) {
    commit(types.REMOVE_ACTIVE_TRANSACTION, tx)
  },
  // Should be used once in a root of the project
  trackActiveTransactions ({ commit, dispatch, state }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS)
    state.updateActiveTransactionsId = setInterval(() => {
      // to update app activities (history)
      dispatch('getAccountActivity', undefined, { root: true })
      commit(types.UPDATE_ACTIVE_TRANSACTIONS)
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL)
  },
  resetActiveTransactions ({ commit }) {
    commit(types.RESET_ACTIVE_TRANSACTIONS)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
