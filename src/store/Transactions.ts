import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import { History, TransactionStatus } from '@sora-substrate/util'

import { dexApi } from '../api'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'ADD_ACTIVE_TRANSACTION',
    'REMOVE_ACTIVE_TRANSACTION',
    'UPDATE_ACTIVE_TRANSACTIONS'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

let updateActiveTransactionsId: any = null

function initialState () {
  return {
    activeTransactions: [] as Array<History>
  }
}

const state = initialState()

const getters = {
  firstReadyTransaction (state) {
    return state.activeTransactions.find(t => [TransactionStatus.Finalized, TransactionStatus.Error].includes(t.status))
  }
}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
    if (updateActiveTransactionsId) {
      clearInterval(updateActiveTransactionsId)
    }
  },

  [types.ADD_ACTIVE_TRANSACTION] (state, tx: History) {
    if (state.activeTransactions.find((t: History) => t.id === tx.id)) {
      return
    }
    state.activeTransactions.push(tx)
  },

  [types.REMOVE_ACTIVE_TRANSACTION] (state, tx: History) {
    if (!state.activeTransactions.find((t: History) => t.id === tx.id)) {
      return
    }
    state.activeTransactions = state.activeTransactions.filter((t: History) => t.id !== tx.id)
  },

  [types.UPDATE_ACTIVE_TRANSACTIONS] (state) {
    if (!dexApi.accountHistory.length) {
      return
    }
    const activeTransactions = dexApi.accountHistory.filter(tx => state.activeTransactions.find(t => t.id === tx.id))
    state.activeTransactions = activeTransactions
  }
}

const actions = {
  addActiveTransaction ({ commit }, { tx }) {
    commit(types.ADD_ACTIVE_TRANSACTION, tx)
  },
  removeActiveTransaction ({ commit }, { tx }) {
    commit(types.REMOVE_ACTIVE_TRANSACTION, tx)
  },
  // Should be used once in a root of the project
  trackActiveTransactions ({ commit }) {
    const twoSeconds = 2 * 1000
    updateActiveTransactionsId = setInterval(() => {
      commit(types.UPDATE_ACTIVE_TRANSACTIONS)
    }, twoSeconds)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
