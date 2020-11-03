import Vue from 'vue'
import Vuex from 'vuex'

import account from './Account'
import router from './Router'

const modules = {
  account,
  router
}

Vue.use(Vuex)

const store = new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
})

export {
  modules
}

export default store
