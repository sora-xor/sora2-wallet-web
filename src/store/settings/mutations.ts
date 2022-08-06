import { defineMutations } from 'direct-vuex';
import { NFTStorage } from 'nft.storage';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { Subscription } from 'rxjs';

import { api } from '../../api';
import { SoraNetwork, WalletAssetFilters, WalletPermissions } from '../../consts';
import { runtimeStorage, storage } from '../../util/storage';
import type { ApiKeysObject } from '../../types/common';
import type { SettingsState } from './types';

const mutations = defineMutations<SettingsState>()({
  setWalletLoaded(state, flag: boolean): void {
    state.isWalletLoaded = flag;
  },
  setPermissions(state, permissions: WalletPermissions): void {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`);
      return;
    }
    state.permissions = { ...state.permissions, ...permissions };
  },
  setSoraNetwork(state, value: Nullable<SoraNetwork>): void {
    state.soraNetwork = value;
  },
  setNetworkFees(state, fees: NetworkFeesObject = {} as NetworkFeesObject): void {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    api.NetworkFee = networkFees;
  },
  updateNetworkFees(state, fees = {} as NetworkFeesObject): void {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    runtimeStorage.set('networkFees', JSON.stringify(networkFees));
  },
  toggleHideBalance(state): void {
    state.shouldBalanceBeHidden = !state.shouldBalanceBeHidden;
    storage.set('shouldBalanceBeHidden', state.shouldBalanceBeHidden);
  },
  setFilterOptions(state, filters: WalletAssetFilters): void {
    // settingsStorage.set('filters', JSON.stringify(filters));
    state.filters = filters;
  },
  setRuntimeVersion(state, version: number): void {
    state.runtimeVersion = version;
    runtimeStorage.set('version', version);
  },
  setRuntimeVersionSubscription(state, subscription: Subscription): void {
    if (state.runtimeVersionSubscription) {
      state.runtimeVersionSubscription.unsubscribe();
    }
    state.runtimeVersionSubscription = subscription;
  },
  resetRuntimeVersionSubscription(state): void {
    if (state.runtimeVersionSubscription) {
      state.runtimeVersionSubscription.unsubscribe();
      state.runtimeVersionSubscription = null;
    }
  },
  setApiKeys(state, keys: ApiKeysObject = {}): void {
    state.apiKeys = { ...state.apiKeys, ...keys };
  },
  setNftStorage(state): void {
    const nftStorage = new NFTStorage({ token: state.apiKeys.nftStorage });
    state.nftStorage = nftStorage;
  },
  setSubqueryEndpoint(state, endpoint: string): void {
    state.subqueryEndpoint = endpoint;
  },
});

export default mutations;
