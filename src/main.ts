// This file is only for local usage
import Vue from 'vue';
import store from './store';
import './store/decorators';
import App from './App.vue';
import i18n from './lang';
import { connection } from './api';
import installWalletPlugins from './plugins';
import { addFearlessWalletLocally } from './util';
import env from '../public/env.json';

import './styles';

installWalletPlugins(Vue, store.original);
addFearlessWalletLocally();

connection.endpoint = env.BLOCKCHAIN_URL;

Vue.config.productionTip = false;
Vue.config.devtools = process.env.NODE_ENV === 'development';

new Vue({
  i18n,
  store: store.original,
  render: (h) => h(App),
}).$mount('#app');
