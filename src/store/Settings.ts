import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import { storage } from '../util/storage'
import i18n from '../lang'
import { Network, WalletPermissions } from '../consts'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_LOCALE',
    'ADD_NETWORK',
    'SET_ACTIVE_NETWORK',
    'SET_PERMISSIONS'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

export const DEFAULT_NETWORKS: Array<Network> = [{
  id: 1,
  name: 'SORA-staging Testnet',
  address: 'wss://ws.stage.sora2.soramitsu.co.jp',
  explorer: 'https://polkascan.io',
  editable: false
}]

function modifyActiveNetwork (state, network: Network) {
  // For now it works as remove operation
  // If it should be removed then DEFAULT_NETWORKS[0] will be set as active network
  if (network && network.name && network.address && network.explorer) {
    state.activeNetwork = network
    storage.set('activeNetwork', JSON.stringify(network))
  } else {
    state.activeNetwork = DEFAULT_NETWORKS[0]
    storage.set('activeNetwork', JSON.stringify(DEFAULT_NETWORKS[0]))
  }
}

function initialState () {
  return {
    locale: storage.get('locale') || i18n.locale,
    locales: i18n.availableLocales,
    activeNetwork: (JSON.parse(storage.get('activeNetwork') as string) || DEFAULT_NETWORKS[0]) as Network,
    customNetworks: (JSON.parse(storage.get('networks') as string) || []) as Array<Network>,
    networks: DEFAULT_NETWORKS,
    permissions: {
      sendAssets: true,
      swapAssets: true
    }
  }
}

const state = initialState()

const getters = {
  availableNetworks (state) {
    return [...state.networks, ...state.customNetworks]
  },
  activeNetwork (state) {
    return state.activeNetwork
  },
  permissions (state) {
    return state.permissions
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

  [types.ADD_NETWORK] (state, { network }) {
    const alreadyExistingNetwork = state.customNetworks.find(({ id }) => id === network.id) as Network
    if (alreadyExistingNetwork) {
      alreadyExistingNetwork.name = network.name
      alreadyExistingNetwork.address = network.address
      alreadyExistingNetwork.explorer = network.explorer
      if (state.activeNetwork.id === alreadyExistingNetwork.id) {
        modifyActiveNetwork(state, alreadyExistingNetwork)
      }
    }
    const customNetworks = (alreadyExistingNetwork ? state.customNetworks : [...state.customNetworks, network])
      // For now it works as remove operation
      .filter(({ name, address, explorer }) => name && address && explorer)
    storage.set('networks', JSON.stringify(customNetworks))
    state.customNetworks = customNetworks
  },

  [types.SET_ACTIVE_NETWORK] (state, { network }) {
    storage.set('activeNetwork', JSON.stringify(network))
    state.activeNetwork = network
    // TODO: add connection
  },

  [types.SET_PERMISSIONS] (state, permissions: WalletPermissions) {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`)
      return
    }
    state.permissions = { ...state.permissions, ...permissions }
  }
}

const actions = {
  setLocale ({ commit }, { locale }) {
    commit(types.SET_LOCALE, { locale })
  },

  addNetwork ({ commit }, { network }) {
    commit(types.ADD_NETWORK, { network })
  },

  setActiveNetwork ({ commit, getters }, { id }) {
    const network = getters.availableNetworks.find(net => net.id === id)
    commit(types.SET_ACTIVE_NETWORK, { network })
  },

  setPermissions ({ commit }, permisssions) {
    commit(types.SET_PERMISSIONS, permisssions)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
