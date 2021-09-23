import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'
import type { NetworkFeesObject } from '@sora-substrate/util'

import { api } from '../api'
import type { WalletPermissions, SoraNetwork } from '../consts'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_PERMISSIONS',
    'SET_SORA_NETWORK',
    'UPDATE_NETWORK_FEES'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

type SettingsState = {
  permissions: WalletPermissions;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
}

function initialState (): SettingsState {
  return {
    permissions: {
      sendAssets: true,
      swapAssets: true
    },
    soraNetwork: null,
    networkFees: {} as NetworkFeesObject // It won't be empty at the moment of usage
  }
}

const state = initialState()

const getters = {
  permissions (state: SettingsState): WalletPermissions {
    return state.permissions
  },
  soraNetwork (state: SettingsState): Nullable<SoraNetwork> {
    return state.soraNetwork
  },
  networkFees (state: SettingsState): NetworkFeesObject {
    return state.networkFees
  }
}

const mutations = {
  [types.SET_PERMISSIONS] (state: SettingsState, permissions: WalletPermissions) {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`)
      return
    }
    state.permissions = { ...state.permissions, ...permissions }
  },

  [types.SET_SORA_NETWORK] (state: SettingsState, value: Nullable<SoraNetwork>) {
    state.soraNetwork = value
  },

  [types.UPDATE_NETWORK_FEES] (state: SettingsState, fees = {} as NetworkFeesObject) {
    state.networkFees = { ...fees }
  }
}

const actions = {
  setPermissions ({ commit }, permissions: WalletPermissions) {
    commit(types.SET_PERMISSIONS, permissions)
  },

  setSoraNetwork ({ commit }, network: Nullable<SoraNetwork>) {
    commit(types.SET_SORA_NETWORK, network)
  },

  updateNetworkFees ({ commit }) {
    commit(types.UPDATE_NETWORK_FEES, api.NetworkFee)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
