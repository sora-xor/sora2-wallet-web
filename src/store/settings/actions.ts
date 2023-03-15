import isEqual from 'lodash/fp/isEqual';
import isEmpty from 'lodash/fp/isEmpty';
import { defineActions } from 'direct-vuex';

import { settingsActionContext } from './../settings';
import { api } from '../../api';
import { runtimeStorage } from '../../util/storage';
import { IpfsStorage } from '../../util/ipfsStorage';
import { GDriveStorage } from '../../services/google';
import { SoraNetwork } from '../../consts';

import type { ApiKeysObject } from '../../types/common';

function areKeysEqual(obj1: object, obj2: object): boolean {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return isEqual(obj1Keys, obj2Keys);
}

const actions = defineActions({
  async setApiKeys(context, keys: ApiKeysObject): Promise<void> {
    const { commit, state } = settingsActionContext(context);

    commit.setApiKeys(keys);

    const {
      apiKeys: { googleApi, googleClientId },
    } = state;

    if (googleApi && googleClientId) {
      GDriveStorage.setOptions(googleApi, googleClientId);
    }
  },
  async createNftStorageInstance(context) {
    const { state, commit } = settingsActionContext(context);

    if (state.soraNetwork === SoraNetwork.Prod) {
      try {
        const { marketplaceDid, ucan } = await IpfsStorage.getUcanTokens();
        commit.setNftStorage({ marketplaceDid, ucan });
      } catch {
        console.error('Error while getting API keys for NFT marketplace.');
      }
    } else {
      commit.setNftStorage({});
    }
  },
  async subscribeOnRuntimeVersion(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    const runtimeVersionSubscription = api.system.getRuntimeVersionObservable().subscribe(async (version) => {
      const runtimeVersion = runtimeStorage.get('version');
      const networkFeesObj = runtimeStorage.get('networkFees');
      const currentVersion = runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0;
      const networkFees = networkFeesObj ? JSON.parse(networkFeesObj) : {};
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
  async resetRuntimeVersionSubscription(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.resetRuntimeVersionSubscription();
  },
});

export default actions;
