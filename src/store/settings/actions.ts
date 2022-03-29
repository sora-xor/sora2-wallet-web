import isEqual from 'lodash/fp/isEqual';
import isEmpty from 'lodash/fp/isEmpty';
import { defineActions } from 'direct-vuex';

import { settingsActionContext } from './../settings';
import { api } from '../../api';
import { runtimeStorage } from '../../util/storage';
import type { ApiKeysObject } from '../../types/common';

function areKeysEqual(obj1: object, obj2: object): boolean {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return isEqual(obj1Keys, obj2Keys);
}

const actions = defineActions({
  async setApiKeys(context, keys: ApiKeysObject): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.setApiKeys(keys);
    commit.setNftStorage();
  },
  async subscribeOnRuntimeVersion(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    const runtimeVersionSubscription = api.system.getRuntimeVersionObservable().subscribe(async (version) => {
      const currentVersion = Number(JSON.parse(runtimeStorage.get('version')));
      const networkFees = JSON.parse(runtimeStorage.get('networkFees'));
      if (currentVersion === version && !isEmpty(networkFees) && areKeysEqual(networkFees, api.NetworkFee)) {
        commit.setNetworkFees(networkFees);
        return;
      }
      if (currentVersion !== version) {
        commit.setRuntimeVersion(version);
      }
      await api.calcStaticNetworkFees();
      commit.updateNetworkFees(api.NetworkFee);
    });
    commit.setRuntimeVersionSubscription(runtimeVersionSubscription);
  },
  /** It's used **only** for subscriptions module */
  async subscribeOnSystemEvents(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.subscribeOnSystemEvents();
  },
  /** It's used **only** for subscriptions module */
  async resetSystemEventsSubscription(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.resetSystemEventsSubscription();
  },
  /** It's used **only** for subscriptions module */
  async resetRuntimeVersionSubscription(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.resetRuntimeVersionSubscription();
  },
});

export default actions;