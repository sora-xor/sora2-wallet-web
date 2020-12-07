import Vue from 'vue'
import App from './App.vue'
import store from './store'
import i18n from './lang'
import { walletApi } from './api'
import * as env from '../public/env.json'

import './plugins'
import './styles'

walletApi.endpoint = env.BLOCKCHAIN_URL

Vue.config.productionTip = false
Vue.config.devtools = process.env.NODE_ENV === 'development'

new Vue({
  i18n,
  store,
  render: h => h(App)
}).$mount('#app')
