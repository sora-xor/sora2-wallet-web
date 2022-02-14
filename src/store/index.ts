import Vue from 'vue';
import Vuex from 'vuex';

import Account from './Account';
import Router from './Router';
import Settings from './Settings';
import Transactions from './Transactions';

Vue.use(Vuex);

const modules = {
  Account,
  Router,
  Settings,
  Transactions,
};

const actions = {
  // Subscriptions dependent on chain state
  activateNetwokSubscriptions({ dispatch }) {
    dispatch('subscribeOnSystemEvents');
    dispatch('subscribeOnRuntimeVersion');
    dispatch('subscribeOnAssets');
    dispatch('subscribeOnAccountAssets');
  },
  resetNetworkSubscriptions({ dispatch }) {
    dispatch('resetSystemEventsSubscription');
    dispatch('resetRuntimeVersionSubscription');
    dispatch('resetAssetsSubscription');
    dispatch('resetAccountAssetsSubscription');
  },
  // Internal subscriptions & timers
  activateInternalSubscriptions({ dispatch }) {
    dispatch('trackActiveTransactions');
    dispatch('subscribeOnFiatPriceAndApyObjectUpdates');
    dispatch('subscribeOnExtensionAvailability');
  },
  resetInternalSubscriptions({ dispatch }) {
    dispatch('resetActiveTransactions');
    dispatch('resetFiatPriceAndApySubscription');
    dispatch('resetExtensionAvailabilitySubscription');
  },
};

const store = new Vuex.Store({
  modules,
  strict: false,
  actions,
});

export { modules };

export default store;
