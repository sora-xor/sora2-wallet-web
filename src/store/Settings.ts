import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import type { NetworkFeesObject } from '@sora-substrate/util';

import { api } from '../api';
import type { WalletPermissions, SoraNetwork } from '../consts';
import { storage } from '../util/storage';

const types = flow(
  flatMap((x) => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat(['SET_PERMISSIONS', 'SET_SORA_NETWORK', 'UPDATE_NETWORK_FEES', 'TOGGLE_HIDE_BALANCE', 'SET_WALLET_LOADED']),
  map((x) => [x, x]),
  fromPairs
)([]);

type SettingsState = {
  isWalletLoaded: boolean;
  permissions: WalletPermissions;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
};

function initialState(): SettingsState {
  return {
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
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    shouldBalanceBeHidden: Boolean(JSON.parse(storage.get('shouldBalanceBeHidden'))) || false,
  };
}

const state = initialState();

const getters = {
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

  [types.UPDATE_NETWORK_FEES](state: SettingsState, fees = {} as NetworkFeesObject) {
    state.networkFees = { ...fees };
  },

  [types.TOGGLE_HIDE_BALANCE](state: SettingsState) {
    state.shouldBalanceBeHidden = !state.shouldBalanceBeHidden;
    storage.set('shouldBalanceBeHidden', state.shouldBalanceBeHidden);
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

  updateNetworkFees({ commit }) {
    commit(types.UPDATE_NETWORK_FEES, api.NetworkFee);
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
