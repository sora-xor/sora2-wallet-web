import { defineActions } from 'direct-vuex';
import debounce from 'lodash/fp/debounce';

import { rootActionContext } from '../../store';

import { subscriptionsActionContext } from './../subscriptions';

import type { ActionContext } from 'vuex';

const runParallel = async (context: ActionContext<any, any>, actionTypes: Array<string>): Promise<void> => {
  const { rootDispatch } = rootActionContext(context);
  const actions = actionTypes.map((value) => value.split('/'));

  await Promise.all(actions.map(([module, fn]) => rootDispatch.wallet[module][fn]()));
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
      'settings/subscribeOnRuntimeVersion',
      'account/subscribeOnAssets',
      'account/subscribeOnAccountAssets',
    ]);
  },
  async resetNetworkSubscriptions(context): Promise<void> {
    await runParallel(context, [
      'settings/resetRuntimeVersionSubscription',
      'account/resetAssetsSubscription',
      'account/resetAccountAssetsSubscription',
    ]);
  },
  // Internal subscriptions & timers
  async activateInternalSubscriptions(context, onDesktop: boolean): Promise<void> {
    const subscriptions = [
      'transactions/trackActiveTxs',
      'transactions/subscribeOnExternalHistory',
      'account/subscribeOnFiatPrice',
      'account/subscribeOnAlerts',
      'subscriptions/subscribeToStorageUpdates',
    ];

    if (!onDesktop) {
      subscriptions.push('account/subscribeOnWalletAvailability');
    }

    await runParallel(context, subscriptions);
  },
  async resetInternalSubscriptions(context): Promise<void> {
    await runParallel(context, [
      'transactions/resetActiveTxs',
      'transactions/resetExternalHistorySubscription',
      'account/resetFiatPriceSubscription',
      'account/resetWalletAvailabilitySubscription',
      'account/resetAccountPassphraseTimer',
      'subscriptions/resetStorageUpdatesSubscription',
    ]);
  },
});

export default actions;
