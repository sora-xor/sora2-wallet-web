import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import * as accountApi from '@/api/account'
import { storage } from '@/util/storage'
import { encrypt } from '@/util'
import { walletApi } from '@/api'
import { KnownAssets } from '@sora-substrate/util'
import { KnownSymbols } from '@sora-substrate/util/build/assets'

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
  'GET_ADDRESS',
  'GET_ACCOUNT_ASSETS',
  'GET_ACCOUNT_ACTIVITY',
  'GET_ASSET_DETAILS',
  'GET_TOKENS',
  'SEARCH_TOKEN',
  'ADD_TOKEN',
  'GET_TRANSACTION_DETAILS'
])

function initialState () {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    password: storage.get('password') || '',
    assets: [],
    selectedAssetDetails: [],
    selectedTransaction: null,
    activity: [],
    tokens: []
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
  },
  tokens (state) {
    return state.tokens
  },
  selectedTransaction (state) {
    return state.selectedTransaction
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
    state.address = params.address
    state.password = encrypt(params.password)
  },

  [types.GET_ADDRESS_REQUEST] (state) {
    state.address = ''
  },

  [types.GET_ADDRESS_SUCCESS] (state, address) {
    state.address = address
  },

  [types.GET_ADDRESS_FAILURE] (state) {
    state.address = ''
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
  },

  [types.GET_TOKENS_REQUEST] (state) {
    state.tokens = []
  },

  [types.GET_TOKENS_SUCCESS] (state, tokens) {
    state.tokens = tokens
  },

  [types.GET_TOKENS_FAILURE] (state) {
    state.tokens = []
  },

  [types.SEARCH_TOKEN_REQUEST] (state) {},

  [types.SEARCH_TOKEN_SUCCESS] (state) {},

  [types.SEARCH_TOKEN_FAILURE] (state) {},

  [types.ADD_TOKEN_REQUEST] (state) {},

  [types.ADD_TOKEN_SUCCESS] (state) {},

  [types.ADD_TOKEN_FAILURE] (state) {},

  [types.GET_TRANSACTION_DETAILS_REQUEST] (state) {
    state.selectedTransaction = null
  },

  [types.GET_TRANSACTION_DETAILS_SUCCESS] (state, transaction) {
    state.selectedTransaction = transaction
  },

  [types.GET_TRANSACTION_DETAILS_FAILURE] (state) {
    state.selectedTransaction = null
  }
}

const actions = {
  async getAccountAssets ({ commit, state: { address } }) {
    commit(types.GET_ACCOUNT_ASSETS_REQUEST)
    try {
      await (
        storage.get('assets')
          ? walletApi.updateAssets()
          : walletApi.getKnownAssets()
      )
      console.log('getAccountAssets', walletApi.accountAssets)
      const xor = KnownAssets.find(item => item.symbol === KnownSymbols.XOR) as any
      commit(types.GET_ACCOUNT_ASSETS_SUCCESS, walletApi.accountAssets)
    } catch (error) {
      console.log(error)
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
  async getTokens ({ commit, state: { address } }) {
    commit(types.GET_TOKENS_REQUEST)
    try {
      const tokens = await accountApi.getTokens(address)
      commit(types.GET_TOKENS_SUCCESS, tokens)
    } catch (error) {
      commit(types.GET_TOKENS_FAILURE)
    }
  },
  async searchToken ({ commit, state: { address } }, { search }) {
    commit(types.SEARCH_TOKEN_REQUEST)
    try {
      const token = await accountApi.searchToken(address, search)
      commit(types.SEARCH_TOKEN_SUCCESS)
      return token
    } catch (error) {
      commit(types.SEARCH_TOKEN_FAILURE)
    }
  },
  async addToken ({ commit, state: { address } }, { token }) {
    commit(types.ADD_TOKEN_REQUEST)
    try {
      await accountApi.addToken(address, token)
      commit(types.ADD_TOKEN_SUCCESS)
    } catch (error) {
      commit(types.ADD_TOKEN_FAILURE)
    }
  },
  async getTransactionDetails ({ commit, state: { address } }, { id }) {
    commit(types.GET_TRANSACTION_DETAILS_REQUEST)
    try {
      const transaction = await accountApi.getTransaction(address, id)
      commit(types.GET_TRANSACTION_DETAILS_SUCCESS, transaction)
    } catch (error) {
      commit(types.GET_TRANSACTION_DETAILS_FAILURE)
    }
  },
  checkValidSeed ({ commit }, { seed }) {
    commit(types.GET_ADDRESS_REQUEST)
    try {
      const address = walletApi.checkSeed(seed).address
      commit(types.GET_ADDRESS_SUCCESS, address)
      return !!address
    } catch (error) {
      commit(types.GET_ADDRESS_FAILURE)
      return false
    }
  },
  login ({ commit }, { name, password, seed }) {
    walletApi.importAccount(seed, name, password)
    commit(types.LOGIN, { name, password, address: walletApi.accountPair.address })
  },
  logout ({ commit }) {
    walletApi.logout()
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
