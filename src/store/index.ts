import Vue from 'vue';
import Vuex from 'vuex';

import Account from './Account';
import Router from './Router';
import Settings from './Settings';
import Transactions from './Transactions';

Vue.use(Vuex);

const actions = {
  // Subscriptions dependent on chain state
  async activateNetwokSubscriptions({ dispatch }) {
    await Promise.all([
      dispatch('subscribeOnSystemEvents'),
      dispatch('subscribeOnRuntimeVersion'),
      dispatch('subscribeOnAssets'),
      dispatch('subscribeOnAccountAssets'),
    ]);
  },
  async resetNetworkSubscriptions({ dispatch }) {
    await Promise.all([
      dispatch('resetSystemEventsSubscription'),
      dispatch('resetRuntimeVersionSubscription'),
      dispatch('resetAssetsSubscription'),
      dispatch('resetAccountAssetsSubscription'),
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions({ dispatch }) {
    await Promise.all([
      dispatch('trackActiveTransactions'),
      dispatch('subscribeOnFiatPriceAndApyObjectUpdates'),
      dispatch('subscribeOnExtensionAvailability'),
    ]);
  },
  async resetInternalSubscriptions({ dispatch }) {
    await Promise.all([
      dispatch('resetActiveTransactions'),
      dispatch('resetFiatPriceAndApySubscription'),
      dispatch('resetExtensionAvailabilitySubscription'),
    ]);
  },
};

const modules = {
  Account,
  Router,
  Settings,
  Transactions,
};

const store = new Vuex.Store({
  modules,
  strict: false,
  actions,
});

export { modules };

export default store;
