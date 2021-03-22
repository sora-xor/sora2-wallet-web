import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import { AccountAsset } from '@sora-substrate/util'

import { api } from '../api'
import { storage } from '../util/storage'
import { getExtension, getExtensionSigner, getExtensionInfo } from '../util'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'LOGOUT',
    'LOGIN',
    'CHANGE_NAME'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'GET_ADDRESS',
  'GET_ACCOUNT_ASSETS',
  'UPDATE_ACCOUNT_ASSETS',
  'GET_ACCOUNT_ACTIVITY',
  'GET_ASSET_DETAILS',
  'GET_ASSETS',
  'SEARCH_ASSET',
  'ADD_ASSET',
  'GET_TRANSACTION_DETAILS',
  'TRANSFER',
  'POLKADOT_JS_IMPORT',
  'GET_SIGNER',
  'GET_POLKADOT_JS_ACCOUNTS'
])

let updateAssetsTimeoutId: any = null

function initialState () {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    password: storage.get('password') || '',
    isExternal: Boolean(storage.get('isExternal')) || false,
    accountAssets: [],
    selectedAssetDetails: [],
    selectedTransaction: null,
    activity: [],
    assets: []
  }
}

const state = initialState()

const getters = {
  isLoggedIn (state) {
    return !state.isExternal
      ? state.address && state.name && state.password
      : state.address
  },
  isExternal (state) {
    return state.isExternal
  },
  account (state) {
    return {
      address: state.address,
      name: state.name,
      password: state.password,
      isExternal: state.isExternal
    }
  },
  accountAssets (state) {
    return state.accountAssets
  },
  activity (state) {
    return state.activity
  },
  selectedAssetDetails (state) {
    return state.selectedAssetDetails
  },
  assets (state) {
    return state.assets
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

  [types.LOGIN] (state, params) {
    state.name = params.name
    state.address = params.address
    state.password = params.password
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
    state.accountAssets = []
  },

  [types.GET_ACCOUNT_ASSETS_SUCCESS] (state, assets) {
    state.accountAssets = assets
  },

  [types.GET_ACCOUNT_ASSETS_FAILURE] (state) {
    state.accountAssets = []
  },

  [types.UPDATE_ACCOUNT_ASSETS_REQUEST] (state) {
  },

  [types.UPDATE_ACCOUNT_ASSETS_SUCCESS] (state, assets) {
    state.accountAssets = assets
  },

  [types.UPDATE_ACCOUNT_ASSETS_FAILURE] (state) {
    state.accountAssets = []
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

  [types.GET_ASSETS_REQUEST] (state) {
    state.assets = []
  },

  [types.GET_ASSETS_SUCCESS] (state, assets) {
    state.assets = assets
  },

  [types.GET_ASSETS_FAILURE] (state) {
    state.assets = []
  },

  [types.SEARCH_ASSET_REQUEST] (state) {},

  [types.SEARCH_ASSET_SUCCESS] (state) {},

  [types.SEARCH_ASSET_FAILURE] (state) {},

  [types.ADD_ASSET_REQUEST] (state) {},

  [types.ADD_ASSET_SUCCESS] (state) {},

  [types.ADD_ASSET_FAILURE] (state) {},

  [types.TRANSFER_REQUEST] (state) {},

  [types.TRANSFER_SUCCESS] (state) {},

  [types.TRANSFER_FAILURE] (state) {},

  [types.GET_SIGNER_REQUEST] (state) {},

  [types.GET_SIGNER_SUCCESS] (state) {},

  [types.GET_SIGNER_FAILURE] (state) {},

  [types.GET_POLKADOT_JS_ACCOUNTS_REQUEST] (state) {},

  [types.GET_POLKADOT_JS_ACCOUNTS_SUCCESS] (state) {},

  [types.GET_POLKADOT_JS_ACCOUNTS_FAILURE] (state) {},

  [types.POLKADOT_JS_IMPORT_REQUEST] (state) {},

  [types.CHANGE_NAME] (state, newName) {
    state.name = newName
  },

  [types.POLKADOT_JS_IMPORT_SUCCESS] (state, account) {
    state.address = account.address
    state.name = account.name
    state.isExternal = true
  },

  [types.POLKADOT_JS_IMPORT_FAILURE] (state) {},

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
  async checkExtension ({ commit }) {
    try {
      await getExtension()
      return true
    } catch (error) {
      return false
    }
  },
  async getSigner ({ commit, state: { address } }) {
    commit(types.GET_SIGNER_REQUEST)
    try {
      await getExtension()
      const signer = await getExtensionSigner(address)
      api.setSigner(signer)
      commit(types.GET_SIGNER_SUCCESS)
    } catch (error) {
      commit(types.GET_SIGNER_FAILURE)
      throw new Error((error as Error).message)
    }
  },
  async getPolkadotJsAccounts ({ commit }) {
    commit(types.GET_POLKADOT_JS_ACCOUNTS_REQUEST)
    try {
      const accounts = (await getExtensionInfo()).accounts
      commit(types.GET_POLKADOT_JS_ACCOUNTS_SUCCESS)
      return accounts
    } catch (error) {
      commit(types.GET_POLKADOT_JS_ACCOUNTS_FAILURE)
      throw new Error((error as Error).message)
    }
  },
  async importPolkadotJs ({ commit }, { address }) {
    commit(types.POLKADOT_JS_IMPORT_REQUEST)
    try {
      const info = await getExtensionInfo()
      const account = info.accounts.find(acc => acc.address === address)
      if (!account) {
        commit(types.POLKADOT_JS_IMPORT_FAILURE)
        throw new Error('polkadotjs.noAccount')
      }
      api.importByPolkadotJs(account.address, account.name)
      api.setSigner(info.signer)
      commit(types.POLKADOT_JS_IMPORT_SUCCESS, account)
    } catch (error) {
      commit(types.POLKADOT_JS_IMPORT_FAILURE)
      throw new Error((error as Error).message)
    }
  },
  async getAccountAssets ({ commit, getters }) {
    if (!getters.isLoggedIn) {
      return
    }
    const assets = storage.get('assets')
    commit(!assets ? types.GET_ACCOUNT_ASSETS_REQUEST : types.UPDATE_ACCOUNT_ASSETS_REQUEST)
    try {
      await (
        assets
          ? api.updateAccountAssets()
          : api.getKnownAccountAssets()
      )
      commit(!assets ? types.GET_ACCOUNT_ASSETS_SUCCESS : types.UPDATE_ACCOUNT_ASSETS_SUCCESS, api.accountAssets)
    } catch (error) {
      commit(!assets ? types.GET_ACCOUNT_ASSETS_FAILURE : types.UPDATE_ACCOUNT_ASSETS_FAILURE)
    }
  },
  async updateAccountAssets ({ dispatch }) {
    if (updateAssetsTimeoutId) {
      clearTimeout(updateAssetsTimeoutId)
    }

    await dispatch('updateAccountAssetsProcess')
  },
  async updateAccountAssetsProcess ({ commit, getters, dispatch }) {
    if (getters.isLoggedIn) {
      commit(types.UPDATE_ACCOUNT_ASSETS_REQUEST)
      try {
        await api.updateAccountAssets()
        commit(types.UPDATE_ACCOUNT_ASSETS_SUCCESS, api.accountAssets)
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS_FAILURE)
      }
    }

    const fiveSeconds = 5 * 1000

    updateAssetsTimeoutId = setTimeout(() => {
      dispatch('updateAccountAssetsProcess')
    }, fiveSeconds)
  },
  async getAssetDetails ({ commit, state: { address } }, { symbol }) {
    commit(types.GET_ASSET_DETAILS_REQUEST)
    try {
      commit(types.GET_ASSET_DETAILS_SUCCESS, {})
    } catch (error) {
      commit(types.GET_ASSET_DETAILS_FAILURE)
    }
  },
  async getAccountActivity ({ commit, state: { address } }) {
    commit(types.GET_ACCOUNT_ACTIVITY_REQUEST)
    try {
      commit(types.GET_ACCOUNT_ACTIVITY_SUCCESS, [])
    } catch (error) {
      commit(types.GET_ACCOUNT_ACTIVITY_FAILURE)
    }
  },
  async getAssets ({ commit }) {
    commit(types.GET_ASSETS_REQUEST)
    try {
      const assets = await api.getAssets()
      commit(types.GET_ASSETS_SUCCESS, assets)
    } catch (error) {
      commit(types.GET_ASSETS_FAILURE)
    }
  },
  async searchAsset ({ commit }, { address }) {
    commit(types.SEARCH_ASSET_REQUEST)
    try {
      const assets = await api.getAssets()
      const asset = assets.find(asset => asset.address === address)
      commit(types.SEARCH_ASSET_SUCCESS)
      return asset
    } catch (error) {
      commit(types.SEARCH_ASSET_FAILURE)
    }
  },
  async addAsset ({ commit }, { address }) {
    commit(types.ADD_ASSET_REQUEST)
    try {
      await api.getAccountAsset(address, true)
      commit(types.ADD_ASSET_SUCCESS)
    } catch (error) {
      commit(types.ADD_ASSET_FAILURE)
    }
  },
  async getTransactionDetails ({ commit, state: { address } }, { id }) {
    commit(types.GET_TRANSACTION_DETAILS_REQUEST)
    try {
      commit(types.GET_TRANSACTION_DETAILS_SUCCESS, {})
    } catch (error) {
      commit(types.GET_TRANSACTION_DETAILS_FAILURE)
    }
  },
  getAddress ({ commit }, { seed }) {
    commit(types.GET_ADDRESS_REQUEST)
    try {
      const address = api.checkSeed(seed).address
      commit(types.GET_ADDRESS_SUCCESS, address)
    } catch (error) {
      commit(types.GET_ADDRESS_FAILURE)
    }
  },
  async transfer ({ commit, getters: { currentRouteParams } }, { to, amount }) {
    commit(types.TRANSFER_REQUEST)
    const asset = currentRouteParams.asset as AccountAsset
    try {
      await api.transfer(asset.address, to, amount)
      commit(types.TRANSFER_SUCCESS)
    } catch (error) {
      commit(types.TRANSFER_FAILURE)
      if (error.message.includes('Invalid decoded address')) {
        throw new Error('walletSend.errorAddress')
      }
      throw new Error(error.message)
    }
  },
  login ({ commit }, { name, password, seed }) {
    api.importAccount(seed, name, password)
    commit(types.LOGIN, { name, password, address: api.accountPair.address })
  },
  changeName ({ commit, state: { name } }, { newName }) {
    const value = `${newName}`.trim()
    if (!value || name === value) {
      return
    }
    commit(types.CHANGE_NAME, newName)
    api.changeName(newName)
  },
  logout ({ commit }) {
    api.logout()
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
