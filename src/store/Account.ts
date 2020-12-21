import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import { AccountAsset } from '@sora-substrate/util'

import * as accountApi from '../api/account'
import { dexApi } from '../api'
import { storage } from '../util/storage'
import { getExtensions, getExtensionSigner } from '../util'

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
  'UPDATE_ACCOUNT_ASSETS',
  'GET_ACCOUNT_ACTIVITY',
  'GET_ASSET_DETAILS',
  'GET_ASSETS',
  'SEARCH_ASSET',
  'ADD_ASSET',
  'GET_TRANSACTION_DETAILS',
  'TRANSFER',
  'POLKADOT_JS_IMPORT',
  'GET_SIGNER'
])

let updateAssetsIntervalId: any = null

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
    if (updateAssetsIntervalId) {
      clearInterval(updateAssetsIntervalId)
    }
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

  [types.POLKADOT_JS_IMPORT_REQUEST] (state) {},

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
  async getSigner ({ commit, state: { address } }) {
    commit(types.GET_SIGNER_REQUEST)
    let extensions: Array<any> = []
    try {
      extensions = await getExtensions()
    } catch (error) {
      commit(types.POLKADOT_JS_IMPORT_FAILURE)
      throw new Error('polkadotjs.noExtensions')
    }
    if (!extensions.length) {
      commit(types.GET_SIGNER_FAILURE)
      throw new Error('polkadotjs.noExtensions')
    }
    const signer = await getExtensionSigner(address)
    dexApi.setSigner(signer)
    commit(types.GET_SIGNER_SUCCESS)
  },
  async importPolkadotJs ({ commit }) {
    commit(types.POLKADOT_JS_IMPORT_REQUEST)
    let extensions: Array<any> = []
    try {
      extensions = await getExtensions()
    } catch (error) {
      commit(types.POLKADOT_JS_IMPORT_FAILURE)
      throw new Error('polkadotjs.noExtensions')
    }
    if (!extensions.length) {
      commit(types.POLKADOT_JS_IMPORT_FAILURE)
      throw new Error('polkadotjs.noExtensions')
    }
    const extension = extensions[0]
    const accounts = await extension.accounts.get()
    if (!accounts.length) {
      commit(types.POLKADOT_JS_IMPORT_FAILURE)
      throw new Error('polkadotjs.noAccounts')
    }
    const account = accounts[0] // TODO: add account selector
    dexApi.importByPolkadotJs(account.address, account.name)
    dexApi.setSigner(extension.signer)
    commit(types.POLKADOT_JS_IMPORT_SUCCESS, account)
  },
  async getAccountAssets ({ commit }) {
    const assets = storage.get('assets')
    commit(!assets ? types.GET_ACCOUNT_ASSETS_REQUEST : types.UPDATE_ACCOUNT_ASSETS_REQUEST)
    try {
      await (
        assets
          ? dexApi.updateAccountAssets()
          : dexApi.getKnownAccountAssets()
      )
      commit(!assets ? types.GET_ACCOUNT_ASSETS_SUCCESS : types.UPDATE_ACCOUNT_ASSETS_SUCCESS, dexApi.accountAssets)
    } catch (error) {
      commit(!assets ? types.GET_ACCOUNT_ASSETS_FAILURE : types.UPDATE_ACCOUNT_ASSETS_FAILURE)
    }
  },
  async updateAccountAssets ({ commit }) {
    const fiveSeconds = 5 * 1000
    updateAssetsIntervalId = setInterval(async () => {
      commit(types.UPDATE_ACCOUNT_ASSETS_REQUEST)
      try {
        await dexApi.updateAccountAssets()
        commit(types.UPDATE_ACCOUNT_ASSETS_SUCCESS, dexApi.accountAssets)
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS_FAILURE)
      }
    }, fiveSeconds)
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
  async getAssets ({ commit }) {
    commit(types.GET_ASSETS_REQUEST)
    try {
      const assets = await dexApi.getAssets()
      commit(types.GET_ASSETS_SUCCESS, assets)
    } catch (error) {
      commit(types.GET_ASSETS_FAILURE)
    }
  },
  async searchAsset ({ commit }, { address }) {
    commit(types.SEARCH_ASSET_REQUEST)
    try {
      if (dexApi.accountAssets.find(asset => asset.address === address)) {
        return null
      }
      // TODO: we will remove this check later and add the ability to register asset by valid address
      const assets = await dexApi.getAssets()
      const asset = assets.find(asset => asset.address === address)
      commit(types.SEARCH_ASSET_SUCCESS)
      return asset
    } catch (error) {
      commit(types.SEARCH_ASSET_FAILURE)
    }
  },
  async addAsset ({ commit }, { asset }) {
    commit(types.ADD_ASSET_REQUEST)
    try {
      await dexApi.getAccountAsset(asset.address)
      commit(types.ADD_ASSET_SUCCESS)
    } catch (error) {
      commit(types.ADD_ASSET_FAILURE)
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
      const address = dexApi.checkSeed(seed).address
      commit(types.GET_ADDRESS_SUCCESS, address)
      return !!address
    } catch (error) {
      commit(types.GET_ADDRESS_FAILURE)
      return false
    }
  },
  async transfer ({ commit, getters: { currentRouteParams } }, { to, amount }) {
    commit(types.TRANSFER_REQUEST)
    const asset = currentRouteParams.asset as AccountAsset
    try {
      await dexApi.transfer(asset.address, to, amount)
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
    dexApi.importAccount(seed, name, password)
    commit(types.LOGIN, { name, password, address: dexApi.accountPair.address })
  },
  logout ({ commit }) {
    dexApi.logout()
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
