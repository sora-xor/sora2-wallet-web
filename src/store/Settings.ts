import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import { storage } from '../util/storage'
import i18n from '../lang'
import { WalletPermissions } from '../consts'

import { SubqueryExplorerService } from '../services/subquery'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_LOCALE',
    'SET_PERMISSIONS',
    'SET_SORA_NETWORK'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

function initialState () {
  return {
    locale: storage.get('locale') || i18n.locale,
    locales: i18n.availableLocales,
    permissions: {
      sendAssets: true,
      swapAssets: true
    },
    soraNetwork: ''
  }
}

const state = initialState()

const getters = {
  permissions (state) {
    return state.permissions
  },
  soraNetwork (state) {
    return state.soraNetwork
  }
}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  },

  [types.SET_LOCALE] (state, { locale }) {
    i18n.locale = locale
    state.locale = locale
    storage.set('locale', locale)
  },

  [types.SET_PERMISSIONS] (state, permissions: WalletPermissions) {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`)
      return
    }
    state.permissions = { ...state.permissions, ...permissions }
  },

  [types.SET_SORA_NETWORK] (state, value = '') {
    state.soraNetwork = value
  }
}

const actions = {
  setLocale ({ commit }, { locale }) {
    commit(types.SET_LOCALE, { locale })
  },

  setPermissions ({ commit }, permisssions) {
    commit(types.SET_PERMISSIONS, permisssions)
  },

  setSoraNetwork ({ commit }, network: string) {
    commit(types.SET_SORA_NETWORK, network)
    // update explorer network
    SubqueryExplorerService.setSoraNetwork(network)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
