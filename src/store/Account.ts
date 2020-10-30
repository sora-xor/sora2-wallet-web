import map from 'lodash/fp/map'
import flatMap from 'lodash/fp/flatMap'
import fromPairs from 'lodash/fp/fromPairs'
import flow from 'lodash/fp/flow'
import concat from 'lodash/fp/concat'

import * as storage from '@/util/storage'

const clearAccountDataStorage = () => {
  // TODO
}

const types = flow(
  flatMap(x => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET',
    'LOGOUT'
  ]),
  map(x => [x, x]),
  fromPairs
)([])

function initialState () {
  return {}
}

const state = initialState()

const getters = {
  isLoggedIn (state) {
    return false
  }
}

const mutations = {
  [types.RESET] (state) {
    const s = initialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  }
}

const actions = {
  logout ({ commit }) {
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
