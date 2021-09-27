import Vue from 'vue';
import Vuex from 'vuex';

import Account from './Account';
import Router from './Router';
import Settings from './Settings';
import Transactions from './Transactions';

const modules = {
  Account,
  Router,
  Settings,
  Transactions,
};

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  strict: false,
});

export { modules };

export default store;
