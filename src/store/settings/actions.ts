import { defineActions } from 'direct-vuex';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import { combineLatest } from 'rxjs';

import { api } from '../../api';
import { IndexerType, SoraNetwork } from '../../consts';
import { GDriveStorage } from '../../services/google';
import { addGDriveWalletLocally } from '../../services/google/wallet';
import { rootActionContext } from '../../store';
import { ApiKeysObject, ConnectionStatus } from '../../types/common';
import { IpfsStorage } from '../../util/ipfsStorage';
import { runtimeStorage } from '../../util/storage';

import { settingsActionContext } from './../settings';

import type { ActionContext } from 'vuex';

function areKeysEqual(obj1: object, obj2: object): boolean {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return isEqual(obj1Keys, obj2Keys);
}

async function switchCurrentIndexer(context: ActionContext<any, any>): Promise<void> {
  const { dispatch, state } = settingsActionContext(context);
  const { rootDispatch } = rootActionContext(context);

  const availableIndexers = Object.entries(state.indexers).reduce<IndexerType[]>((buffer, [indexerType, data]) => {
    if (data.status !== ConnectionStatus.Unavailable) {
      buffer.push(indexerType as IndexerType);
    }
    return buffer;
  }, []);

  const next = availableIndexers[0];

  if (next) {
    await dispatch.selectIndexer(next);
  } else {
    // fallback for fiat values
    await rootDispatch.wallet.account.useCeresApiForFiatValues(true);
  }
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

  async selectIndexer(context, indexerType?: IndexerType): Promise<void> {
    const { commit, dispatch, state } = settingsActionContext(context);
    const { rootDispatch } = rootActionContext(context);
    const indexer = indexerType || state.indexerType;

    try {
      await rootDispatch.wallet.subscriptions.resetIndexerSubscriptions();

      commit.setIndexerType(indexer);

      await rootDispatch.wallet.subscriptions.activateIndexerSubscriptions();
    } catch (error) {
      console.error(error);
      await dispatch.setIndexerStatus({ indexer, status: ConnectionStatus.Unavailable });
    }
  },

  async setIndexerStatus(
    context,
    { indexer, status }: { indexer: IndexerType; status: ConnectionStatus }
  ): Promise<void> {
    const { commit } = settingsActionContext(context);

    commit.setIndexerStatus({ indexer, status });
    // if current indexer is unavailable, try switch to next
    if (status === ConnectionStatus.Unavailable) {
      await switchCurrentIndexer(context);
    }
  },
});

export default actions;
