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

const plugin = (store) => {
  const unsubscribe = store.watch(
    (state, getters) => {
      return !!getters.isLoggedIn;
    },
    (val, oldVal) => {
      if (val && !oldVal) {
        store.dispatch('getAccountAssets');
        store.dispatch('subscribeOnAccountAssets');
      } else if (!val && oldVal) {
        store.dispatch('resetAccountAssetsSubscription');
      }

      store.dispatch('checkCurrentRoute');
    },
    {
      immediate: true,
    }
  );
};

Vue.use(Vuex);

const store = new Vuex.Store({
  modules,
  plugins: [plugin],
  strict: false,
});

export { modules };

export default store;
