import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import omit from 'lodash/fp/omit'
import { AccountAsset, getWhitelistAssets, getWhitelistIdsBySymbol, WhitelistArrayItem, Whitelist, axiosInstance, History, Asset } from '@sora-substrate/util'
import type { Subscription } from '@polkadot/x-rxjs'

import { api, getCeresTokensData } from '../api'
import { storage } from '../util/storage'
import { getExtension, getExtensionSigner, getExtensionInfo, toHashTable } from '../util'
import type { Account, PolkadotJsAccount } from '../types/common'

type WhitelistParams = { whitelist: Array<WhitelistArrayItem>; withoutFiat?: boolean }

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET_ACCOUNT',
    'RESET_ACCOUNT_ASSETS_SUBSCRIPTION',
    'LOGOUT',
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
  'GET_ASSETS',
  'SEARCH_ASSET',
  'ADD_ASSET',
  'TRANSFER',
  'IMPORT_POLKADOT_JS_ACCOUNT',
  'GET_SIGNER',
  'GET_POLKADOT_JS_ACCOUNTS',
  'GET_WHITELIST'
])

type AccountState = {
  address: string;
  name: string;
  isExternal: boolean;
  accountAssets: Array<AccountAsset>;
  selectedTransactionId: Nullable<string>;
  activity: Array<History>;
  assets: Array<Asset>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  whitelistArray: Array<WhitelistArrayItem>;
  assetsLoading: boolean;
  withoutFiat: boolean;
  updateAccountAssetsSubscription: Nullable<Subscription>;
}

function initialState (): AccountState {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    isExternal: Boolean(storage.get('isExternal')) || false,
    accountAssets: [],
    selectedTransactionId: null,
    activity: [], // account history (without bridge)
    assets: [],
    polkadotJsAccounts: [],
    whitelistArray: [],
    assetsLoading: false,
    withoutFiat: false,
    updateAccountAssetsSubscription: null
  }
}

const state = initialState()

const getters = {
  isLoggedIn (state: AccountState) {
    return state.isExternal && state.address
  },
  isExternal (state: AccountState) {
    return state.isExternal
  },
  account (state: AccountState): Account {
    return {
      address: state.address,
      name: state.name,
      isExternal: state.isExternal
    }
  },
  accountAssets (state: AccountState) {
    return state.accountAssets
  },
  accountAssetsAddressTable (state: AccountState) {
    return toHashTable(state.accountAssets, 'address')
  },
  activity (state: AccountState) {
    return state.activity
  },
  assets (state: AccountState) {
    return state.assets
  },
  polkadotJsAccounts (state: AccountState) {
    return state.polkadotJsAccounts
  },
  whitelistArray (state: AccountState): Array<WhitelistArrayItem> {
    return state.whitelistArray
  },
  whitelist (state: AccountState): Whitelist {
    return (state.whitelistArray && state.whitelistArray.length) ? getWhitelistAssets(state.whitelistArray) : {}
  },
  whitelistIdsBySymbol (state: AccountState) {
    return (state.whitelistArray && state.whitelistArray.length) ? getWhitelistIdsBySymbol(state.whitelistArray) : {}
  },
  withoutFiat (state: AccountState): boolean {
    return state.withoutFiat
  },
  assetsLoading (state: AccountState) {
    return state.assetsLoading
  },
  selectedTransaction (state: AccountState, getters): History {
    return getters.activity.find(item => item.id === state.selectedTransactionId)
  }
}

const mutations = {
  [types.RESET_ACCOUNT] (state: AccountState) {
    const s = omit(['whitelistArray', 'assets'], initialState())
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION] (state: AccountState) {
    if (state.updateAccountAssetsSubscription) {
      state.updateAccountAssetsSubscription.unsubscribe()
      state.updateAccountAssetsSubscription = null
    }
  },

  [types.SYNC_WITH_STORAGE] (state: AccountState) {
    state.address = storage.get('address') || ''
    state.name = storage.get('name') || ''
    state.isExternal = Boolean(storage.get('isExternal')) || false
    state.accountAssets = api.accountAssets // to save reactivity
    state.activity = api.accountHistory
  },

  [types.GET_ADDRESS_REQUEST] (state: AccountState) {
    state.address = ''
  },

  [types.GET_ADDRESS_SUCCESS] (state: AccountState, address: string) {
    state.address = address
  },

  [types.GET_ADDRESS_FAILURE] (state: AccountState) {
    state.address = ''
  },

  [types.GET_ACCOUNT_ASSETS_REQUEST] (state: AccountState) {
    state.accountAssets = []
  },

  [types.GET_ACCOUNT_ASSETS_SUCCESS] (state: AccountState, assets: Array<AccountAsset>) {
    state.accountAssets = assets
  },

  [types.GET_ACCOUNT_ASSETS_FAILURE] (state: AccountState) {
    state.accountAssets = []
  },

  [types.UPDATE_ACCOUNT_ASSETS_REQUEST] (state: AccountState) {
  },

  [types.UPDATE_ACCOUNT_ASSETS_SUCCESS] (state: AccountState, assets: Array<AccountAsset>) {
    state.accountAssets = assets
  },

  [types.UPDATE_ACCOUNT_ASSETS_FAILURE] (state: AccountState) {
    state.accountAssets = []
  },

  [types.GET_ACCOUNT_ACTIVITY] (state: AccountState, activity: Array<History>) {
    state.activity = activity
  },

  [types.GET_ASSETS_REQUEST] (state: AccountState) {
    state.assets = []
    state.assetsLoading = true
  },

  [types.GET_ASSETS_SUCCESS] (state: AccountState, assets: Array<Asset>) {
    state.assets = assets
    state.assetsLoading = false
  },

  [types.GET_ASSETS_FAILURE] (state: AccountState) {
    state.assets = []
    state.assetsLoading = false
  },

  [types.GET_WHITELIST_REQUEST] (state: AccountState) {
    state.whitelistArray = []
    state.withoutFiat = false
  },

  [types.GET_WHITELIST_SUCCESS] (state: AccountState, params: WhitelistParams) {
    state.whitelistArray = params.whitelist
    if (params.withoutFiat) {
      state.withoutFiat = true
    }
  },

  [types.GET_WHITELIST_FAILURE] (state: AccountState) {
    state.whitelistArray = []
    state.withoutFiat = true
  },

  [types.SEARCH_ASSET_REQUEST] (state: AccountState) {},
  [types.SEARCH_ASSET_SUCCESS] (state: AccountState) {},
  [types.SEARCH_ASSET_FAILURE] (state: AccountState) {},

  [types.ADD_ASSET_REQUEST] (state: AccountState) {},
  [types.ADD_ASSET_SUCCESS] (state: AccountState) {},
  [types.ADD_ASSET_FAILURE] (state: AccountState) {},

  [types.TRANSFER_REQUEST] (state: AccountState) {},
  [types.TRANSFER_SUCCESS] (state: AccountState) {},
  [types.TRANSFER_FAILURE] (state: AccountState) {},

  [types.GET_SIGNER_REQUEST] (state: AccountState) {},
  [types.GET_SIGNER_SUCCESS] (state: AccountState) {},
  [types.GET_SIGNER_FAILURE] (state: AccountState) {},

  [types.GET_POLKADOT_JS_ACCOUNTS_REQUEST] (state: AccountState) {
    state.polkadotJsAccounts = []
  },
  [types.GET_POLKADOT_JS_ACCOUNTS_SUCCESS] (state: AccountState, polkadotJsAccounts: Array<PolkadotJsAccount>) {
    state.polkadotJsAccounts = polkadotJsAccounts
  },
  [types.GET_POLKADOT_JS_ACCOUNTS_FAILURE] (state: AccountState) {
    state.polkadotJsAccounts = []
  },

  [types.IMPORT_POLKADOT_JS_ACCOUNT_REQUEST] (state: AccountState) {},

  [types.IMPORT_POLKADOT_JS_ACCOUNT_SUCCESS] (state: AccountState, name: string) {
    state.address = api.address
    state.name = name
    state.isExternal = true
  },

  [types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE] (state: AccountState) {},

  [types.SET_TRANSACTION_DETAILS_ID] (state: AccountState, id: string) {
    state.selectedTransactionId = id
  }
}

const actions = {
  /** TODO: check its usage */
  formatAddress ({ commit }, address: string) {
    return api.formatAddress(address)
  },
  async checkExtension ({ commit }) {
    try {
      await getExtension()
      return true
    } catch (error) {
      return false
    }
  },
  async checkSigner ({ dispatch, getters }) {
    if (getters.isExternal) {
      try {
        await dispatch('getSigner')
      } catch (error) {
        console.error(error)
        dispatch('logout')
      }
    }
  },
  async getSigner ({ commit, state: { address } }) {
    commit(types.GET_SIGNER_REQUEST)
    try {
      await getExtension()
      const defaultAddress = api.formatAddress(address, false)
      const signer = await getExtensionSigner(defaultAddress)
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
      commit(types.GET_POLKADOT_JS_ACCOUNTS_SUCCESS, accounts)
    } catch (error) {
      commit(types.GET_POLKADOT_JS_ACCOUNTS_FAILURE)
    }
  },
  async importPolkadotJs ({ commit, dispatch }, address: string) {
    commit(types.IMPORT_POLKADOT_JS_ACCOUNT_REQUEST)
    try {
      const defaultAddress = api.formatAddress(address, false)
      const info = await getExtensionInfo()
      const account = info.accounts.find(acc => acc.address === defaultAddress)
      if (!account) {
        commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE)
        throw new Error('polkadotjs.noAccount')
      }
      api.importByPolkadotJs(account.address, account.name)
      api.setSigner(info.signer)
      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_SUCCESS, account.name)
      if (!state.updateAccountAssetsSubscription) {
        await dispatch('getAccountAssets')
        await dispatch('updateAccountAssets')
      }
    } catch (error) {
      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE)
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
        state.updateAccountAssetsSubscription = api.assetsBalanceUpdated.subscribe(data => {
          commit(types.UPDATE_ACCOUNT_ASSETS_SUCCESS, api.accountAssets)
        })
        api.updateAccountAssets()
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS_FAILURE)
      }
    }
  },
  getAccountActivity ({ commit }) {
    commit(types.GET_ACCOUNT_ACTIVITY, api.accountHistory)
  },
  async getWhitelist ({ commit }) {
    commit(types.GET_WHITELIST_REQUEST)
    try {
      const { data } = await axiosInstance.get('/whitelist.json')
      const cerestokenApiObj = await getCeresTokensData()
      if (!cerestokenApiObj) {
        commit(types.GET_WHITELIST_SUCCESS, { whitelist: data, withoutFiat: true } as WhitelistParams)
        return
      }

      const dataWithPrice = data.map(item => {
        const asset = item
        const price = cerestokenApiObj[item.address]
        if (price) {
          asset.price = price
        }
        return asset
      })
      commit(types.GET_WHITELIST_SUCCESS, { whitelist: dataWithPrice } as WhitelistParams)
    } catch (error) {
      commit(types.GET_WHITELIST_FAILURE)
    }
  },
  async getAssets ({ commit, getters: { whitelist } }) {
    commit(types.GET_ASSETS_REQUEST)
    try {
      const assets = await api.getAssets(whitelist)
      commit(types.GET_ASSETS_SUCCESS, assets)
    } catch (error) {
      commit(types.GET_ASSETS_FAILURE)
    }
  },
  async searchAsset ({ commit, getters: { whitelist } }, address: string) {
    commit(types.SEARCH_ASSET_REQUEST)
    try {
      const assets = await api.getAssets(whitelist)
      const asset = assets.find(asset => asset.address === address)
      commit(types.SEARCH_ASSET_SUCCESS)
      return asset
    } catch (error) {
      commit(types.SEARCH_ASSET_FAILURE)
    }
  },
  async addAsset ({ commit }, address: string) {
    commit(types.ADD_ASSET_REQUEST)
    try {
      await api.getAccountAsset(address, true)
      commit(types.ADD_ASSET_SUCCESS)
    } catch (error) {
      commit(types.ADD_ASSET_FAILURE)
    }
  },
  getTransactionDetails ({ commit }, id: string) {
    commit(types.SET_TRANSACTION_DETAILS_ID, id)
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
  logout ({ commit }) {
    api.logout()
    commit(types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION)
    commit(types.RESET_ACCOUNT)
  },
  resetAccountAssetsSubscription ({ commit }) {
    commit(types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION)
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
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
