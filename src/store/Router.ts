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
    currentRoute: RouteNames.WalletConnection
  }
}

const state = initialState()

const getters = {
  currentRoute (state) {
    return state.currentRoute
  }
}

const mutations = {
  [types.NAVIGATE] (state, name: RouteNames) {
    state.currentRoute = name
  }
}

const actions = {
  navigate ({ commit }, { name }) {
    commit(types.NAVIGATE, name)
  }
}

export default {
  types,
  state,
  getters,
  mutations,
  actions
}
