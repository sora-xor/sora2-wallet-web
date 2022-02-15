import Vue from 'vue';
import Vuex from 'vuex';

import Account from './Account';
import Router from './Router';
import Settings from './Settings';
import Transactions from './Transactions';
import Subscriptions from './Subscriptions';

Vue.use(Vuex);

Vue.use(Vuex);

const runParallel = async (actions: Array<AsyncVoidFn>) => {
  const results = await Promise.allSettled(actions);

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  });
};

const actions = {
  // Subscriptions dependent on chain state
  async activateNetwokSubscriptions({ dispatch }) {
    await runParallel([
      dispatch('subscribeOnSystemEvents'),
      dispatch('subscribeOnRuntimeVersion'),
      dispatch('subscribeOnAssets'),
      dispatch('subscribeOnAccountAssets'),
    ]);
  },
  async resetNetworkSubscriptions({ dispatch }) {
    await runParallel([
      dispatch('resetSystemEventsSubscription'),
      dispatch('resetRuntimeVersionSubscription'),
      dispatch('resetAssetsSubscription'),
      dispatch('resetAccountAssetsSubscription'),
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions({ dispatch }) {
    await runParallel([
      dispatch('trackActiveTransactions'),
      dispatch('subscribeOnFiatPriceAndApyObjectUpdates'),
      dispatch('subscribeOnExtensionAvailability'),
    ]);
  },
  async resetInternalSubscriptions({ dispatch }) {
    await runParallel([
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
  Subscriptions,
};

const store = new Vuex.Store({
  modules,
  strict: false,
  actions,
});

export { modules };

export default store;
