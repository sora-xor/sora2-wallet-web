// This file is only for local usage
import Vue from 'vue';

import env from '../public/env.json';

import App from './App.vue';
import { connection } from './api';
import i18n from './lang';
import installWalletPlugins from './plugins';
import store from './store';

import './store/decorators';
import './styles';

installWalletPlugins(Vue, store.original);

connection.endpoint = env.BLOCKCHAIN_URL;

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === 'development';

new Vue({
  i18n,
  store: store.original,
  render: (h) => h(App),
}).$mount('#app');
