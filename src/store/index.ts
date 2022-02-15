import Vue from 'vue';
import Vuex from 'vuex';

import Account from './Account';
import Router from './Router';
import Settings from './Settings';
import Transactions from './Transactions';
import Subscriptions from './Subscriptions';

Vue.use(Vuex);

const modules = {
  Account,
  Router,
  Settings,
  Transactions,
  Subscriptions,
};

const store = new Vuex.Store({
  modules,
  strict: false,
});

export { modules };

export default store;
