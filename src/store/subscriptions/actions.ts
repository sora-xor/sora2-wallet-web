import { defineActions } from 'direct-vuex';
import debounce from 'lodash/fp/debounce';
import type { ActionContext } from 'vuex';

import { subscriptionsActionContext } from './../subscriptions';
import { rootActionContext } from '../../store';

const runParallel = async (context: ActionContext<any, any>, actionTypes: Array<string>): Promise<void> => {
  const { rootDispatch } = rootActionContext(context);
  const actions = actionTypes.map((value) => value.split('/'));
  const results = await Promise.allSettled(actions.map(([module, fn]) => rootDispatch.wallet[module][fn]()));

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error(result.reason);
    }
  });
};

const actions = defineActions({
  async resetStorageUpdatesSubscription(context): Promise<void> {
    const { state, commit } = subscriptionsActionContext(context);
    if (state.storageUpdatesSubscription) {
      window.removeEventListener('storage', state.storageUpdatesSubscription);
      commit.setSubscription(null);
    }
  },
  async subscribeToStorageUpdates(context): Promise<void> {
    const { state, commit, dispatch } = subscriptionsActionContext(context);
    const { rootDispatch } = rootActionContext(context);
    await dispatch.resetStorageUpdatesSubscription();

    commit.setSubscription(
      debounce(100)(() => {
        rootDispatch.wallet.account.syncWithStorage();
        rootDispatch.wallet.transactions.getAccountHistory();
      })
    );

    window.addEventListener('storage', state.storageUpdatesSubscription as VoidFunction);
  },
  // Subscriptions dependent on chain state
  async activateNetwokSubscriptions(context): Promise<void> {
    await runParallel(context, [
      'settings/subscribeOnSystemEvents',
      'settings/subscribeOnRuntimeVersion',
      'account/subscribeOnAssets',
      'account/subscribeOnAccountAssets',
    ]);
  },
  async resetNetworkSubscriptions(context): Promise<void> {
    await runParallel(context, [
      'settings/resetSystemEventsSubscription',
      'settings/resetRuntimeVersionSubscription',
      'account/resetAssetsSubscription',
      'account/resetAccountAssetsSubscription',
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions(context, onDesktop: boolean): Promise<void> {
    let subscriptions = [
      'transactions/trackActiveTxs',
      'account/subscribeOnFiatPriceAndApyObjectUpdates',
      'subscriptions/subscribeToStorageUpdates',
    ];

    subscriptions = onDesktop ? [...subscriptions, 'account/subscribeOnExtensionAvailability'] : subscriptions;

    await runParallel(context, subscriptions);
  },
  async resetInternalSubscriptions(context): Promise<void> {
    await runParallel(context, [
      'transactions/resetActiveTxs',
      'account/resetFiatPriceAndApySubscription',
      'account/resetExtensionAvailabilitySubscription',
      'subscriptions/resetStorageUpdatesSubscription',
    ]);
  },
});

export default actions;
