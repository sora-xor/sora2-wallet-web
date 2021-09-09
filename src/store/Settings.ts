import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import type { WalletPermissions } from '../consts'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_PERMISSIONS',
    'SET_SORA_NETWORK'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

type SettingsState = {
  permissions: WalletPermissions;
  soraNetwork: string;
}

function initialState (): SettingsState {
  return {
    permissions: {
      sendAssets: true,
      swapAssets: true
    },
    soraNetwork: ''
  }
}

const state = initialState()

const getters = {
  permissions (state: SettingsState) {
    return state.permissions
  },
  soraNetwork (state: SettingsState) {
    return state.soraNetwork
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

  [types.SET_SORA_NETWORK] (state: SettingsState, value = '') {
    state.soraNetwork = value
  }
}

const actions = {
  setPermissions ({ commit }, permissions: WalletPermissions) {
    commit(types.SET_PERMISSIONS, permissions)
  },

  setSoraNetwork ({ commit }, network: string) {
    commit(types.SET_SORA_NETWORK, network)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
