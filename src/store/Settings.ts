import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import isEmpty from 'lodash/fp/isEmpty';
import isEqual from 'lodash/fp/isEqual';
import { NFTStorage } from 'nft.storage';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { Subscription } from '@polkadot/x-rxjs';

import { api } from '../api';
import type { WalletPermissions, SoraNetwork } from '../consts';
import { storage, runtimeStorage } from '../util/storage';
import { ApiKeysObject } from '../types/common';

function areKeysEqual(obj1: object, obj2: object): boolean {
  const obj1Keys = Object.keys(obj1).sort();
  const obj2Keys = Object.keys(obj2).sort();
  return isEqual(obj1Keys, obj2Keys);
}

const types = flow(
  flatMap((x) => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'SET_PERMISSIONS',
    'SET_SORA_NETWORK',
    'UPDATE_NETWORK_FEES',
    'SET_RUNTIME_VERSION',
    'TOGGLE_HIDE_BALANCE',
    'SET_WALLET_LOADED',
    'SET_NETWORK_FEES',
    'RESET_RUNTIME_VERSION_SUBSCRIPTION',
    'SET_NFT_STORAGE',
    'SET_API_KEYS',
  ]),
  map((x) => [x, x]),
  fromPairs
)([]);

type SettingsState = {
  apiKeys: ApiKeysObject;
  isWalletLoaded: boolean;
  permissions: WalletPermissions;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
  runtimeVersion: number;
  runtimeVersionSubscription: Nullable<Subscription>;
  nftStorage: any;
};

function initialState(): SettingsState {
  return {
    apiKeys: {} as ApiKeysObject,
    isWalletLoaded: false, // wallet is loading
    permissions: {
      addAssets: true,
      addLiquidity: true,
      bridgeAssets: true,
      copyAssets: true,
      createAssets: true,
      sendAssets: true,
      swapAssets: true,
      showAssetDetails: true,
    },
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: Number(JSON.parse(runtimeStorage.get('version'))),
    runtimeVersionSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    shouldBalanceBeHidden: Boolean(JSON.parse(storage.get('shouldBalanceBeHidden'))) || false,
  };
}

const state = initialState();

const getters = {
  apiKeys(state: SettingsState): ApiKeysObject {
    return state.apiKeys;
  },
  isWalletLoaded(state: SettingsState): boolean {
    return state.isWalletLoaded;
  },
  permissions(state: SettingsState): WalletPermissions {
    return state.permissions;
  },
  soraNetwork(state: SettingsState): Nullable<SoraNetwork> {
    return state.soraNetwork;
  },
  networkFees(state: SettingsState): NetworkFeesObject {
    return state.networkFees;
  },
  shouldBalanceBeHidden(state: SettingsState): boolean {
    return state.shouldBalanceBeHidden;
  },
  nftStorage(state: SettingsState): any {
    return state.nftStorage;
  },
};

const mutations = {
  [types.SET_WALLET_LOADED](state: SettingsState, flag: boolean) {
    state.isWalletLoaded = flag;
  },
  [types.SET_PERMISSIONS](state: SettingsState, permissions: WalletPermissions) {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`);
      return;
    }
    state.permissions = { ...state.permissions, ...permissions };
  },

  [types.SET_SORA_NETWORK](state: SettingsState, value: Nullable<SoraNetwork>) {
    state.soraNetwork = value;
  },

  [types.SET_NETWORK_FEES](state: SettingsState, fees = {} as NetworkFeesObject) {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    api.NetworkFee = networkFees;
  },

  [types.UPDATE_NETWORK_FEES](state: SettingsState, fees = {} as NetworkFeesObject) {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    runtimeStorage.set('networkFees', JSON.stringify(networkFees));
  },

  [types.TOGGLE_HIDE_BALANCE](state: SettingsState) {
    state.shouldBalanceBeHidden = !state.shouldBalanceBeHidden;
    storage.set('shouldBalanceBeHidden', state.shouldBalanceBeHidden);
  },

  [types.SET_RUNTIME_VERSION](state: SettingsState, version: number) {
    state.runtimeVersion = version;
    runtimeStorage.set('version', version);
  },

  [types.RESET_RUNTIME_VERSION_SUBSCRIPTION](state: SettingsState) {
    if (state.runtimeVersionSubscription) {
      state.runtimeVersionSubscription.unsubscribe();
      state.runtimeVersionSubscription = null;
    }
  },

  [types.SET_API_KEYS](state, keys = {}) {
    state.apiKeys = { ...state.apiKeys, ...keys };
  },

  [types.SET_NFT_STORAGE](state: SettingsState, nftStorage: any) {
    state.nftStorage = nftStorage;
  },
};

const actions = {
  setWalletLoaded({ commit }, flag: boolean) {
    commit(types.SET_WALLET_LOADED, flag);
  },

  setPermissions({ commit }, permissions: WalletPermissions) {
    commit(types.SET_PERMISSIONS, permissions);
  },

  setSoraNetwork({ commit }, network: Nullable<SoraNetwork>) {
    commit(types.SET_SORA_NETWORK, network);
  },

  setApiKeys({ commit, dispatch }, keys) {
    commit(types.SET_API_KEYS, keys);

    dispatch('setNftStorage');
  },

  setNftStorage({ commit, state }) {
    const nftStorage = new NFTStorage({ token: state.apiKeys.nftStorage });
    commit(types.SET_NFT_STORAGE, nftStorage);
  },

  subscribeOnRuntimeVersion({ commit, state }) {
    state.runtimeVersionSubscription = api.getRuntimeVersionObservable().subscribe(async (version) => {
      const currentVersion = Number(JSON.parse(runtimeStorage.get('version')));
      const networkFees = JSON.parse(runtimeStorage.get('networkFees'));
      if (currentVersion === version && !isEmpty(networkFees) && areKeysEqual(networkFees, api.NetworkFee)) {
        commit(types.SET_NETWORK_FEES, networkFees);
        return;
      }
      if (currentVersion !== version) {
        commit(types.SET_RUNTIME_VERSION, version);
      }
      await api.calcStaticNetworkFees();
      commit(types.UPDATE_NETWORK_FEES, api.NetworkFee);
    });
  },

  resetRuntimeVersionSubscription({ commit }) {
    commit(types.RESET_RUNTIME_VERSION_SUBSCRIPTION);
  },

  toggleHideBalance({ commit }) {
    commit(types.TOGGLE_HIDE_BALANCE);
  },
};

export default {
  types,
  state,
  getters,
  mutations,
  actions,
};
