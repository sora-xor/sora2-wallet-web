import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import { RouteNames } from '../consts'

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'NAVIGATE'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

function initialState () {
  return {
    currentRoute: RouteNames.WalletConnection,
    currentRouteParams: {}
  }
}

const state = initialState()

const getters = {
  currentRoute (state) {
    return state.currentRoute
  },
  currentRouteParams (state) {
    return state.currentRouteParams
  }
}

const mutations = {
  [types.NAVIGATE] (state, args) {
    state.currentRoute = args.name
    state.currentRouteParams = args.params || {}
  }
}

const actions = {
  navigate ({ commit }, { name, params }) {
    commit(types.NAVIGATE, { name, params })
  },
  checkCurrentRoute ({ dispatch, getters, rootGetters }) {
    const { currentRoute } = getters
    const { isLoggedIn } = rootGetters

    if (isLoggedIn && currentRoute === RouteNames.WalletConnection) {
      dispatch('navigate', { name: RouteNames.Wallet })
    } else if (!isLoggedIn && currentRoute !== RouteNames.WalletConnection) {
      dispatch('navigate', { name: RouteNames.WalletConnection })
    }
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
