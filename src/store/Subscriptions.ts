import type { Dispatch } from 'vuex';

const runParallel = async (dispatch: Dispatch, actionTypes: Array<string>) => {
  const results = await Promise.allSettled(actionTypes.map((type) => dispatch(type, undefined, { root: true })));

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  });
};

const actions = {
  // Subscriptions dependent on chain state
  async activateNetwokSubscriptions({ dispatch }) {
    await runParallel(dispatch, [
      'subscribeOnSystemEvents',
      'subscribeOnRuntimeVersion',
      'subscribeOnAssets',
      'subscribeOnAccountAssets',
    ]);
  },
  async resetNetworkSubscriptions({ dispatch }) {
    await runParallel(dispatch, [
      'resetSystemEventsSubscription',
      'resetRuntimeVersionSubscription',
      'resetAssetsSubscription',
      'resetAccountAssetsSubscription',
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions({ dispatch }) {
    await runParallel(dispatch, [
      'trackActiveTransactions',
      'subscribeOnFiatPriceAndApyObjectUpdates',
      'subscribeOnExtensionAvailability',
    ]);
  },
  async resetInternalSubscriptions({ dispatch }) {
    await runParallel(dispatch, [
      'resetActiveTransactions',
      'resetFiatPriceAndApySubscription',
      'resetExtensionAvailabilitySubscription',
    ]);
  },
};

export default {
  actions,
};
