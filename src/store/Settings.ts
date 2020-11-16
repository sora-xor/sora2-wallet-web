import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import * as storage from '../util/storage'
import i18n from '../lang'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_LOCALE',
    'ADD_NETWORK',
    'SET_ACTIVE_NETWORK'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

const DEFAULT_NETWORKS = [{
  id: 0,
  name: 'Main Ethereum Network',
  address: 'https://api.infura.io/v1/jsonrpc/mainnet',
  explorer: 'https://etherscan.io',
  editable: false
}, {
  id: 1,
  name: 'Ropsten Network',
  address: 'https://api.infura.io/v1/jsonrpc/ropsten',
  explorer: 'https://ropsten.etherscan.io',
  editable: false
}]

function initialState () {
  return {
    locale: storage.getItem('locale') || i18n.locale,
    locales: i18n.availableLocales,
    activeNetwork: JSON.parse(storage.getItem('activeNetwork') as any) || DEFAULT_NETWORKS[0],
    customNetworks: JSON.parse(storage.getItem('networks') as string) || [],
    networks: DEFAULT_NETWORKS
  }
}

const state = initialState()

const getters = {
  availableNetworks (state) {
    return [...state.networks, ...state.customNetworks]
  },
  activeNetwork (state) {
    return state.activeNetwork
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
    storage.setItem('locale', locale)
  },

  [types.ADD_NETWORK] (state, { network }) {
    const networks = [...state.customNetworks, network]
    storage.setItem('networks', JSON.stringify(networks))
    state.customNetworks = networks
  },

  [types.SET_ACTIVE_NETWORK] (state, { network }) {
    storage.setItem('activeNetwork', JSON.stringify(network))
    state.activeNetwork = network
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
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
