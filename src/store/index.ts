import Vue from 'vue'
import Vuex from 'vuex'

import Account from './Account'
import Router from './Router'
import Settings from './Settings'

const modules = {
  Account,
  Router,
  Settings
}

Vue.use(Vuex)

const store = new Vuex.Store({
  modules,
  strict: false
})

export {
  modules
}

export default store
