import debounce from 'lodash/fp/debounce';
import type { Dispatch } from 'vuex';

const runParallel = async (dispatch: Dispatch, actionTypes: Array<string>): Promise<void> => {
  const results = await Promise.allSettled(actionTypes.map((type) => dispatch(type, undefined, { root: true })));

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  });
};

type SubscriptionsState = {
  storageUpdatesSubscription: Nullable<VoidFunction>;
};

type SubscriptionsContext = {
  state: SubscriptionsState;
  dispatch: Dispatch;
};

function initialState(): SubscriptionsState {
  return {
    storageUpdatesSubscription: null,
  };
}

const state = initialState();

const actions = {
  async subscribeToStorageUpdates({ state, dispatch }: SubscriptionsContext) {
    await dispatch('resetStorageUpdatesSubscription');

    state.storageUpdatesSubscription = debounce(100)(() => {
      dispatch('syncWithStorage', undefined, { root: true });
      dispatch('getAccountHistory', undefined, { root: true });
    });

    window.addEventListener('storage', state.storageUpdatesSubscription);
  },

  resetStorageUpdatesSubscription({ state }: SubscriptionsContext) {
    if (state.storageUpdatesSubscription) {
      window.removeEventListener('storage', state.storageUpdatesSubscription);
      state.storageUpdatesSubscription = null;
    }
  },

  // Subscriptions dependent on chain state
  async activateNetwokSubscriptions({ dispatch }: SubscriptionsContext) {
    await runParallel(dispatch, [
      'subscribeOnSystemEvents',
      'subscribeOnRuntimeVersion',
      'subscribeOnAssets',
      'subscribeOnAccountAssets',
    ]);
  },
  async resetNetworkSubscriptions({ dispatch }: SubscriptionsContext) {
    await runParallel(dispatch, [
      'resetSystemEventsSubscription',
      'resetRuntimeVersionSubscription',
      'resetAssetsSubscription',
      'resetAccountAssetsSubscription',
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions({ dispatch }: SubscriptionsContext) {
    await runParallel(dispatch, [
      'trackActiveTransactions',
      'subscribeOnFiatPriceAndApyObjectUpdates',
      'subscribeToStorageUpdates',
    ]);
  },
  async resetInternalSubscriptions({ dispatch }: SubscriptionsContext) {
    await runParallel(dispatch, [
      'resetActiveTransactions',
      'resetFiatPriceAndApySubscription',
      'resetExtensionAvailabilitySubscription',
      'resetStorageUpdatesSubscription',
    ]);
  },
};

export default {
  state,
  actions,
};
