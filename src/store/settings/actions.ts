import { defineActions } from 'direct-vuex';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import { combineLatest } from 'rxjs';

import { api } from '../../api';
import { IndexerType, SoraNetwork } from '../../consts';
import { GDriveStorage } from '../../services/google';
import { addGDriveWalletLocally } from '../../services/google/wallet';
import { rootActionContext } from '../../store';
import { IpfsStorage } from '../../util/ipfsStorage';
import { runtimeStorage } from '../../util/storage';

import { settingsActionContext } from './../settings';

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
      addGDriveWalletLocally();
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
  async subscribeOnFeeMultiplierAndRuntime(context): Promise<void> {
    const { commit } = settingsActionContext(context);

    const subscription = combineLatest([
      api.system.getRuntimeVersionObservable(),
      api.system.getNetworkFeeMultiplierObservable(),
    ]).subscribe(async ([runtime, multiplier]) => {
      const runtimeVersion = runtimeStorage.get('version');
      const feeMultiplier = runtimeStorage.get('feeMultiplier');
      const networkFeesObj = runtimeStorage.get('networkFees');
      const localMultiplier = feeMultiplier ? Number(JSON.parse(feeMultiplier)) : 0;
      const localRuntime = runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0;
      const networkFees = networkFeesObj ? JSON.parse(networkFeesObj) : {};

      if (
        localRuntime === runtime &&
        localMultiplier === multiplier &&
        !isEmpty(networkFees) &&
        areKeysEqual(networkFees, api.NetworkFee)
      ) {
        commit.setNetworkFees(networkFees);
        return;
      }
      if (localMultiplier !== multiplier) {
        commit.setFeeMultiplier(multiplier);
      }
      if (localRuntime !== runtime) {
        commit.setRuntimeVersion(runtime);
      }

      await api.calcStaticNetworkFees();
      commit.updateNetworkFees(api.NetworkFee);
    });

    commit.setFeeMultiplierAndRuntimeSubscriptions(subscription);
  },
  /** It's used **only** for subscriptions module */
  async resetFeeMultiplierAndRuntimeSubscriptions(context): Promise<void> {
    const { commit } = settingsActionContext(context);
    commit.resetFeeMultiplierAndRuntimeSubscriptions();
  },
  async selectIndexer(context, indexerType: IndexerType): Promise<void> {
    const { commit } = settingsActionContext(context);
    const { rootDispatch } = rootActionContext(context);

    await rootDispatch.wallet.subscriptions.resetIndexerSubscriptions();

    commit.setIndexerType(indexerType);

    await rootDispatch.wallet.subscriptions.activateIndexerSubscriptions();
  },
});

export default actions;
