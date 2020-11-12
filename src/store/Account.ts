import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import * as accountApi from '@/api/account'
import * as storage from '@/util/storage'
import { encrypt } from '@/util'

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
  'GET_ACCOUNT',
  'GET_ACCOUNT_ASSETS',
  'GET_ACCOUNT_ACTIVITY',
  'GET_ASSET_DETAILS'
])

function initialState () {
  return {
    address: storage.getItem('address') || '',
    name: storage.getItem('name') || '',
    password: storage.getItem('password') || '',
    assets: [],
    selectedAssetDetails: [],
    activity: []
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
  },
  assets (state) {
    return state.assets
  },
  activity (state) {
    return state.activity
  },
  selectedAssetDetails (state) {
    return state.selectedAssetDetails
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
    const password = encrypt(params.password)
    state.password = password
    storage.setItem('name', params.name)
    storage.setItem('password', password)
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
  },

  [types.GET_ACCOUNT_ASSETS_REQUEST] (state) {
    state.assets = []
  },

  [types.GET_ACCOUNT_ASSETS_SUCCESS] (state, assets) {
    state.assets = assets
  },

  [types.GET_ACCOUNT_ASSETS_FAILURE] (state) {
    state.assets = []
  },

  [types.GET_ACCOUNT_ACTIVITY_REQUEST] (state) {
    state.activity = []
  },

  [types.GET_ACCOUNT_ACTIVITY_SUCCESS] (state, activity) {
    state.activity = activity
  },

  [types.GET_ACCOUNT_ACTIVITY_FAILURE] (state) {
    state.activity = []
  },

  [types.GET_ASSET_DETAILS_REQUEST] (state) {
    state.selectedAssetDetails = []
  },

  [types.GET_ASSET_DETAILS_SUCCESS] (state, data) {
    state.selectedAssetDetails = data
  },

  [types.GET_ASSET_DETAILS_FAILURE] (state) {
    state.selectedAssetDetails = []
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
  async getAccountAssets ({ commit, state: { address } }) {
    commit(types.GET_ACCOUNT_ASSETS_REQUEST)
    try {
      const assets = await accountApi.getAccountAssets(address)
      commit(types.GET_ACCOUNT_ASSETS_SUCCESS, assets)
    } catch (error) {
      commit(types.GET_ACCOUNT_ASSETS_FAILURE)
    }
  },
  async getAssetDetails ({ commit, state: { address } }, { symbol }) {
    commit(types.GET_ASSET_DETAILS_REQUEST)
    try {
      const data = await accountApi.getAssetDetails(address, symbol)
      commit(types.GET_ASSET_DETAILS_SUCCESS, data)
    } catch (error) {
      commit(types.GET_ASSET_DETAILS_FAILURE)
    }
  },
  async getAccountActivity ({ commit, state: { address } }) {
    commit(types.GET_ACCOUNT_ACTIVITY_REQUEST)
    try {
      const activity = await accountApi.getAccountActivity(address)
      commit(types.GET_ACCOUNT_ACTIVITY_SUCCESS, activity)
    } catch (error) {
      commit(types.GET_ACCOUNT_ACTIVITY_FAILURE)
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
