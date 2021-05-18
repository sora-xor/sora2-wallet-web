import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import { AccountAsset } from '@sora-substrate/util'
import { isWhitelistAsset } from 'polkaswap-token-whitelist'

import { api } from '../api'
import { storage } from '../util/storage'
import { getExtension, getExtensionSigner, getExtensionInfo, toHashTable } from '../util'

export let updateAccountAssetsSubscription: any = null

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'LOGOUT',
    'LOGIN',
    'CHANGE_NAME',
    'SYNC_WITH_STORAGE',
    'SET_TRANSACTION_DETAILS_ID',
    'GET_ACCOUNT_ACTIVITY'
  ]),
  map(x => [x, x]),
  fromPairs
)([
  'GET_ADDRESS',
  'GET_ACCOUNT_ASSETS',
  'UPDATE_ACCOUNT_ASSETS',
  'GET_ASSET_DETAILS',
  'GET_ASSETS',
  'SEARCH_ASSET',
  'ADD_ASSET',
  'TRANSFER',
  'POLKADOT_JS_IMPORT',
  'GET_SIGNER',
  'GET_POLKADOT_JS_ACCOUNTS'
])

function initialState () {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    password: storage.get('password') || '',
    isExternal: Boolean(storage.get('isExternal')) || false,
    accountAssets: [],
    selectedAssetDetails: [],
    selectedTransactionId: null,
    activity: [], // account history (without bridge)
    assets: [],
    assetsLoading: false
  }
}

const state = initialState()

const getters = {
  isLoggedIn (state) {
    return !state.isExternal
      ? !!state.address && !!state.name && !!state.password
      : !!state.address
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
  accountAssetsAddressTable (state) {
    return toHashTable(state.accountAssets, 'address')
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
  whitelistAssets (state) {
    return state.assets.filter(asset => isWhitelistAsset(asset))
  },
  nonWhitelistAssets (state) {
    return state.assets.filter(asset => !isWhitelistAsset(asset))
  },
  assetsLoading (state) {
    return state.assetsLoading
  },
  selectedTransaction (state, getters) {
    return getters.activity.find(item => item.id === state.selectedTransactionId)
  }
}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.SYNC_WITH_STORAGE] (state) {
    state.address = storage.get('address') || ''
    state.name = storage.get('name') || ''
    state.password = storage.get('password') || ''
    state.isExternal = Boolean(storage.get('isExternal')) || false
    state.accountAssets = api.accountAssets // to save reactivity
    state.activity = api.accountHistory
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

  [types.GET_ACCOUNT_ACTIVITY] (state, activity) {
    state.activity = activity
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
    state.assetsLoading = true
  },

  [types.GET_ASSETS_SUCCESS] (state, assets) {
    state.assets = assets
    state.assetsLoading = false
  },

  [types.GET_ASSETS_FAILURE] (state) {
    state.assets = []
    state.assetsLoading = false
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

  [types.SET_TRANSACTION_DETAILS_ID] (state, id) {
    state.selectedTransactionId = id
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
  async importPolkadotJs ({ commit, dispatch }, { address }) {
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
      if (!updateAccountAssetsSubscription) {
        await dispatch('getAccountAssets')
        await dispatch('updateAccountAssets')
      }
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
    if (assets && getters.accountAssets.length !== 0) {
      return
    }
    commit(types.GET_ACCOUNT_ASSETS_REQUEST)
    try {
      await api.getKnownAccountAssets()
      commit(types.GET_ACCOUNT_ASSETS_SUCCESS, api.accountAssets)
    } catch (error) {
      commit(types.GET_ACCOUNT_ASSETS_FAILURE)
    }
  },
  async updateAccountAssets ({ commit, getters }) {
    if (getters.isLoggedIn) {
      commit(types.UPDATE_ACCOUNT_ASSETS_REQUEST)
      try {
        updateAccountAssetsSubscription = api.assetsBalanceUpdated.subscribe(data => {
          commit(types.UPDATE_ACCOUNT_ASSETS_SUCCESS, api.accountAssets)
        })
        api.updateAccountAssets()
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS_FAILURE)
      }
    }
  },
  async getAssetDetails ({ commit, state: { address } }, { symbol }) {
    commit(types.GET_ASSET_DETAILS_REQUEST)
    try {
      commit(types.GET_ASSET_DETAILS_SUCCESS, {})
    } catch (error) {
      commit(types.GET_ASSET_DETAILS_FAILURE)
    }
  },
  getAccountActivity ({ commit }) {
    commit(types.GET_ACCOUNT_ACTIVITY, api.accountHistory)
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
  getTransactionDetails ({ commit }, id) {
    commit(types.SET_TRANSACTION_DETAILS_ID, id)
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
    if (updateAccountAssetsSubscription) {
      updateAccountAssetsSubscription.unsubscribe()
      updateAccountAssetsSubscription = null
    }
    commit(types.RESET)
  },
  async syncWithStorage ({ commit, state, getters, dispatch }) {
    // previous state
    const { isLoggedIn } = getters
    const { address } = state

    commit(types.SYNC_WITH_STORAGE)

    // check log in/out state changes after sync
    if (getters.isLoggedIn !== isLoggedIn || state.address !== address) {
      if (getters.isLoggedIn) {
        await dispatch('importPolkadotJs', { address: state.address })
      } else if (api.accountPair) {
        dispatch('logout')
      }
    }

    dispatch('checkCurrentRoute', undefined, { root: true })
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
