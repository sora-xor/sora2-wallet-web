import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import * as accountApi from '@/api/account'
import * as storage from '@/util/storage'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'LOGOUT',
    'LOGIN'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'GET_ACCOUNT'
])

function initialState () {
  return {
    address: storage.getItem('address') || '',
    name: storage.getItem('name') || '',
    password: storage.getItem('password') || ''
  }
}

const state = initialState()

const getters = {
  isLoggedIn (state) {
    return state.address && state.name && state.password
  },
  account (state) {
    return {
      address: state.address,
      name: state.name,
      password: state.password
    }
  }
}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.LOGOUT] (state, params) {
    storage.clear()
  },

  [types.LOGIN] (state, params) {
    state.name = params.name
    state.password = params.password
    storage.setItem('name', params.name)
    storage.setItem('password', params.password)
  },

  [types.GET_ACCOUNT_REQUEST] (state) {
    state.address = ''
    state.name = ''
    storage.clear()
  },

  [types.GET_ACCOUNT_SUCCESS] (state, account) {
    state.name = account.name
    state.address = account.address
    storage.setItem('name', account.name)
    storage.setItem('address', account.address)
  },

  [types.GET_ACCOUNT_FAILURE] (state) {
    state.address = ''
    state.name = ''
    storage.clear()
  }
}

const actions = {
  async getAccount ({ commit }, { seed }) {
    commit(types.GET_ACCOUNT_REQUEST)
    try {
      const account = await accountApi.getAccount(seed)
      commit(types.GET_ACCOUNT_SUCCESS, account)
    } catch (error) {
      commit(types.GET_ACCOUNT_FAILURE)
    }
  },
  login ({ commit, state: { address } }, { name, password }) {
    commit(types.LOGIN, { name, password })
  },
  logout ({ commit }) {
    commit(types.LOGOUT)
    commit(types.RESET)
  },
  reset ({ commit }) {
    commit(types.RESET)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
