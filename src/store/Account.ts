import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import omit from 'lodash/fp/omit';
import { axiosInstance, History, FPNumber } from '@sora-substrate/util';
import type { Subscription } from '@polkadot/x-rxjs';
import type { AccountAsset, Asset, Whitelist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { api } from '../api';
import { storage } from '../util/storage';
import {
  getExtension,
  getExtensionSigner,
  getExtensionInfo,
  subscribeToPolkadotJsAccounts,
  toHashTable,
  WHITE_LIST_GITHUB_URL,
} from '../util';
import { SubqueryExplorerService } from '../services/subquery';
import type { FiatPriceAndApyObject, ReferrerRewards } from '../services/types';
import type { Account, PolkadotJsAccount, AccountAssetsTable } from '../types/common';

const HOUR = 60 * 60 * 1000;
const CHECK_EXTENSION_INTERVAL = 5 * 1000;

const EMPTY_REFERRAL_REWARDS: ReferrerRewards = {
  rewards: FPNumber.ZERO,
  invitedUserRewards: {},
};

const types = flow(
  flatMap((x) => [x + '_REQUEST', x + '_SUCCESS', x + '_FAILURE']),
  concat([
    'RESET_ACCOUNT',
    'RESET_ASSETS_SUBSCRIPTION',
    'RESET_ACCOUNT_ASSETS_SUBSCRIPTION',
    'RESET_FIAT_PRICE_AND_APY_SUBSCRIPTION',
    'LOGOUT',
    'SYNC_WITH_STORAGE',
    'SET_TRANSACTION_DETAILS_ID',
    'GET_ACCOUNT_ACTIVITY',
    'SET_POLKADOT_JS_ACCOUNTS',
    'RESET_POLKADOT_JS_ACCOUNTS_SUBSCRIPTION',
    'SET_EXTENSION_AVAILABILIY',
    'RESET_EXTENSION_AVAILABILIY_SUBSCRIPTION',
    'UPDATE_ASSETS',
    'UPDATE_ACCOUNT_ASSETS',
  ]),
  map((x) => [x, x]),
  fromPairs
)([
  'GET_ACCOUNT_ASSETS',
  'ADD_ASSET',
  'TRANSFER',
  'IMPORT_POLKADOT_JS_ACCOUNT',
  'GET_WHITELIST',
  'GET_FIAT_PRICE_AND_APY_OBJECT',
  'GET_REFERRAL_REWARDS',
]);

type AccountState = {
  address: string;
  name: string;
  isExternal: boolean;
  selectedTransactionId: Nullable<string>;
  activity: Array<History>;
  assets: Array<Asset>;
  assetsSubscription: Nullable<Subscription>;
  accountAssets: Array<AccountAsset>;
  accountAssetsSubscription: Nullable<Subscription>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  polkadotJsAccountsSubscription: Nullable<VoidFunction>;
  whitelistArray: Array<WhitelistArrayItem>;
  withoutFiatAndApy: boolean;
  fiatPriceAndApyObject: Nullable<FiatPriceAndApyObject>;
  fiatPriceAndApyTimer: Nullable<NodeJS.Timer>;
  referralRewards: ReferrerRewards;
  extensionAvailability: boolean;
  extensionAvailabilityTimer: Nullable<NodeJS.Timeout>;
};

function initialState(): AccountState {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    isExternal: Boolean(JSON.parse(storage.get('isExternal'))) || false,
    selectedTransactionId: null,
    activity: [], // account history (without bridge)
    // assets & subscription
    assets: [],
    assetsSubscription: null,
    // account assets & subscription
    accountAssets: [],
    accountAssetsSubscription: null,
    // polkadot js accounts & subscription
    polkadotJsAccounts: [],
    polkadotJsAccountsSubscription: null,
    whitelistArray: [],
    withoutFiatAndApy: false,
    fiatPriceAndApyObject: {},
    fiatPriceAndApyTimer: null,
    referralRewards: EMPTY_REFERRAL_REWARDS,
    extensionAvailability: false,
    extensionAvailabilityTimer: null,
  };
}

const state = initialState();

const getters = {
  isLoggedIn(state: AccountState): boolean {
    return state.isExternal && !!state.address;
  },
  isExternal(state: AccountState): boolean {
    return state.isExternal;
  },
  account(state: AccountState): Account {
    return {
      address: state.address,
      name: state.name,
      isExternal: state.isExternal,
    };
  },
  accountAssets(state: AccountState): Array<AccountAsset> {
    return state.accountAssets;
  },
  accountAssetsAddressTable(state: AccountState): AccountAssetsTable {
    return toHashTable(state.accountAssets, 'address');
  },
  activity(state: AccountState): Array<History> {
    return state.activity;
  },
  assets(state: AccountState): Array<Asset> {
    return state.assets;
  },
  polkadotJsAccounts(state: AccountState): Array<PolkadotJsAccount> {
    return state.polkadotJsAccounts;
  },
  whitelistArray(state: AccountState): Array<WhitelistArrayItem> {
    return state.whitelistArray;
  },
  whitelist(state: AccountState): Whitelist {
    return state.whitelistArray && state.whitelistArray.length ? api.assets.getWhitelist(state.whitelistArray) : {};
  },
  whitelistIdsBySymbol(state: AccountState): any {
    return state.whitelistArray && state.whitelistArray.length
      ? api.assets.getWhitelistIdsBySymbol(state.whitelistArray)
      : {};
  },
  withoutFiatAndApy(state: AccountState): boolean {
    return state.withoutFiatAndApy;
  },
  fiatPriceAndApyObject(state: AccountState): Nullable<FiatPriceAndApyObject> {
    return state.fiatPriceAndApyObject;
  },
  selectedTransaction(state: AccountState, getters): History {
    return getters.activity.find((item) => item.id === state.selectedTransactionId);
  },
  referralRewards(state: AccountState): ReferrerRewards {
    return state.referralRewards;
  },
  extensionAvailability(state: AccountState): boolean {
    return state.extensionAvailability;
  },
};

const mutations = {
  [types.RESET_FIAT_PRICE_AND_APY_SUBSCRIPTION](state: AccountState) {
    if (state.fiatPriceAndApyTimer) {
      clearInterval(state.fiatPriceAndApyTimer);
      state.fiatPriceAndApyTimer = null;
    }
  },

  [types.RESET_ACCOUNT](state: AccountState) {
    const s = omit(
      [
        'whitelistArray',
        'fiatPriceAndApyObject',
        'fiatPriceAndApyTimer',
        'assets',
        'polkadotJsAccounts',
        'polkadotJsAccountsSubscription',
        'extensionAvailability',
        'extensionAvailabilityTimer',
      ],
      initialState()
    );
    Object.keys(s).forEach((key) => {
      state[key] = s[key];
    });
  },

  [types.RESET_ASSETS_SUBSCRIPTION](state: AccountState) {
    if (state.assetsSubscription) {
      state.assetsSubscription.unsubscribe();
      state.assetsSubscription = null;
    }
  },

  [types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION](state: AccountState) {
    if (state.accountAssetsSubscription) {
      state.accountAssetsSubscription.unsubscribe();
      state.accountAssetsSubscription = null;
    }
  },

  [types.SYNC_WITH_STORAGE](state: AccountState) {
    state.address = storage.get('address') || '';
    state.name = storage.get('name') || '';
    state.isExternal = Boolean(storage.get('isExternal')) || false;
    state.accountAssets = api.assets.accountAssets; // to save reactivity
    state.activity = api.historyList;
  },

  [types.GET_ACCOUNT_ASSETS_REQUEST](state: AccountState) {
    state.accountAssets = [];
  },

  [types.GET_ACCOUNT_ASSETS_SUCCESS](state: AccountState, assets: Array<AccountAsset>) {
    state.accountAssets = assets;
  },

  [types.GET_ACCOUNT_ASSETS_FAILURE](state: AccountState) {
    state.accountAssets = [];
  },

  [types.UPDATE_ASSETS](state: AccountState, assets: Array<Asset>) {
    state.assets = assets;
  },

  [types.UPDATE_ACCOUNT_ASSETS](state: AccountState, assets: Array<AccountAsset>) {
    state.accountAssets = assets;
  },

  [types.GET_ACCOUNT_ACTIVITY](state: AccountState, activity: Array<History>) {
    state.activity = activity;
  },

  [types.GET_WHITELIST_REQUEST](state: AccountState) {
    state.whitelistArray = [];
  },

  [types.GET_WHITELIST_SUCCESS](state: AccountState, whitelistArray: Array<WhitelistArrayItem>) {
    state.whitelistArray = whitelistArray;
  },

  [types.GET_WHITELIST_FAILURE](state: AccountState) {
    state.whitelistArray = [];
  },

  [types.GET_FIAT_PRICE_AND_APY_OBJECT_REQUEST](state: AccountState) {},

  [types.GET_FIAT_PRICE_AND_APY_OBJECT_SUCCESS](state: AccountState, object: FiatPriceAndApyObject) {
    state.fiatPriceAndApyObject = object;
    state.withoutFiatAndApy = false;
  },

  [types.GET_FIAT_PRICE_AND_APY_OBJECT_FAILURE](state: AccountState) {
    state.fiatPriceAndApyObject = {};
    state.withoutFiatAndApy = true;
  },

  [types.GET_REFERRAL_REWARDS_REQUEST](state: AccountState) {
    state.referralRewards = EMPTY_REFERRAL_REWARDS;
  },
  [types.GET_REFERRAL_REWARDS_SUCCESS](state: AccountState, referralRewards: ReferrerRewards) {
    state.referralRewards = referralRewards;
  },
  [types.GET_REFERRAL_REWARDS_FAILURE](state: AccountState) {
    state.referralRewards = EMPTY_REFERRAL_REWARDS;
  },

  [types.ADD_ASSET_REQUEST](state: AccountState) {},
  [types.ADD_ASSET_SUCCESS](state: AccountState) {},
  [types.ADD_ASSET_FAILURE](state: AccountState) {},

  [types.TRANSFER_REQUEST](state: AccountState) {},
  [types.TRANSFER_SUCCESS](state: AccountState) {},
  [types.TRANSFER_FAILURE](state: AccountState) {},

  [types.SET_POLKADOT_JS_ACCOUNTS](state: AccountState, polkadotJsAccounts: Array<PolkadotJsAccount>) {
    state.polkadotJsAccounts = polkadotJsAccounts;
  },

  [types.RESET_POLKADOT_JS_ACCOUNTS_SUBSCRIPTION](state: AccountState) {
    if (typeof state.polkadotJsAccountsSubscription === 'function') {
      state.polkadotJsAccountsSubscription();
    }
    state.polkadotJsAccountsSubscription = null;
  },

  [types.IMPORT_POLKADOT_JS_ACCOUNT_REQUEST](state: AccountState) {},

  [types.IMPORT_POLKADOT_JS_ACCOUNT_SUCCESS](state: AccountState, name: string) {
    state.address = api.address;
    state.name = name;
    state.isExternal = true;
  },

  [types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE](state: AccountState) {},

  [types.SET_TRANSACTION_DETAILS_ID](state: AccountState, id: string) {
    state.selectedTransactionId = id;
  },

  [types.SET_EXTENSION_AVAILABILIY](state: AccountState, availability: boolean) {
    state.extensionAvailability = availability;
  },

  [types.RESET_EXTENSION_AVAILABILIY_SUBSCRIPTION](state: AccountState) {
    if (state.extensionAvailabilityTimer) {
      clearInterval(state.extensionAvailabilityTimer);
      state.extensionAvailabilityTimer = null;
    }
  },
};

const actions = {
  async checkExtension({ commit, dispatch, state, getters }) {
    try {
      await getExtension();
      commit(types.SET_EXTENSION_AVAILABILIY, true);

      if (!state.polkadotJsAccountsSubscription) {
        await dispatch('subscribeToPolkadotJsAccounts');
      }
    } catch (error) {
      commit(types.SET_EXTENSION_AVAILABILIY, false);

      await dispatch('resetPolkadotJsAccountsSubscription');

      if (getters.isLoggedIn) {
        await dispatch('logout');
      }
    }
  },

  async afterLogin({ dispatch }) {
    await dispatch('getAccountAssets');
    await dispatch('subscribeOnAccountAssets');
    await dispatch('checkCurrentRoute', undefined, { root: true });
  },

  async logout({ commit, dispatch }) {
    if (api.accountPair) {
      api.logout();
    }

    await dispatch('resetAccountAssetsSubscription');

    commit(types.RESET_ACCOUNT);

    await dispatch('checkCurrentRoute', undefined, { root: true });
  },

  async checkSigner({ dispatch, getters }) {
    if (getters.isLoggedIn) {
      try {
        const signer = await dispatch('getSigner');

        api.setSigner(signer);

        await dispatch('afterLogin');
      } catch (error) {
        console.error(error);
        await dispatch('logout');
      }
    }
  },

  async getSigner({ state: { address } }) {
    const defaultAddress = api.formatAddress(address, false);
    const signer = await getExtensionSigner(defaultAddress);

    return signer;
  },

  subscribeOnExtensionAvailability({ dispatch, state }) {
    dispatch('checkExtension');

    state.extensionAvailabilityTimer = setInterval(() => {
      dispatch('checkExtension');
    }, CHECK_EXTENSION_INTERVAL);
  },

  async resetExtensionAvailabilitySubscription({ commit, dispatch }) {
    commit(types.RESET_EXTENSION_AVAILABILIY_SUBSCRIPTION);

    await dispatch('resetPolkadotJsAccountsSubscription');
  },

  async updatePolkadotJsAccounts({ commit, dispatch, getters }, accounts: Array<PolkadotJsAccount>) {
    commit(types.SET_POLKADOT_JS_ACCOUNTS, accounts);

    if (getters.isLoggedIn) {
      try {
        await dispatch('getSigner');
      } catch (error) {
        await dispatch('logout');
      }
    }
  },

  async subscribeToPolkadotJsAccounts({ dispatch, state }) {
    dispatch('resetPolkadotJsAccountsSubscription');

    state.polkadotJsAccountsSubscription = await subscribeToPolkadotJsAccounts(async (accounts) => {
      await dispatch('updatePolkadotJsAccounts', accounts);
    });
  },

  resetPolkadotJsAccountsSubscription({ commit }) {
    commit(types.SET_POLKADOT_JS_ACCOUNTS, []);
    commit(types.RESET_POLKADOT_JS_ACCOUNTS_SUBSCRIPTION);
  },

  async importPolkadotJs({ commit, dispatch }, address: string) {
    commit(types.IMPORT_POLKADOT_JS_ACCOUNT_REQUEST);
    try {
      const defaultAddress = api.formatAddress(address, false);
      const info = await getExtensionInfo();
      const account = info.accounts.find((acc) => acc.address === defaultAddress);
      if (!account) {
        commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE);
        throw new Error('polkadotjs.noAccount');
      }
      api.importByPolkadotJs(account.address, account.name);
      api.setSigner(info.signer);

      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_SUCCESS, account.name);

      await dispatch('afterLogin');
    } catch (error) {
      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE);
      throw new Error((error as Error).message);
    }
  },

  async getAccountAssets({ commit, getters }) {
    if (!getters.isLoggedIn || (api.assets.accountAssets.length && getters.accountAssets.length !== 0)) {
      return;
    }
    commit(types.GET_ACCOUNT_ASSETS_REQUEST);
    try {
      await api.assets.getKnownAccountAssets();
      commit(types.GET_ACCOUNT_ASSETS_SUCCESS, api.assets.accountAssets);
    } catch (error) {
      commit(types.GET_ACCOUNT_ASSETS_FAILURE);
    }
  },

  async getAssets({ commit, getters: { whitelist } }) {
    try {
      const assets = await api.assets.getAssets(whitelist);
      commit(types.UPDATE_ASSETS, assets);
    } catch (error) {
      commit(types.UPDATE_ASSETS, []);
    }
  },

  async subscribeOnAssets({ dispatch, state }) {
    await dispatch('resetAssetsSubscription');
    await dispatch('getAssets');

    state.assetsSubscription = api.system.updated.subscribe((events) => {
      if (events.find((e) => e.event.section === 'assets' && e.event.method === 'AssetRegistered')) {
        dispatch('getAssets');
      }
    });
  },

  resetAssetsSubscription({ commit }) {
    commit(types.RESET_ASSETS_SUBSCRIPTION);
  },

  async subscribeOnAccountAssets({ commit, dispatch, getters, state }) {
    await dispatch('resetAccountAssetsSubscription');

    if (getters.isLoggedIn) {
      try {
        state.accountAssetsSubscription = api.assets.balanceUpdated.subscribe((data) => {
          commit(types.UPDATE_ACCOUNT_ASSETS, api.assets.accountAssets);
        });
        api.assets.updateAccountAssets();
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS, []);
      }
    }
  },

  resetAccountAssetsSubscription({ commit }) {
    commit(types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION);
  },

  getAccountActivity({ commit }) {
    commit(types.GET_ACCOUNT_ACTIVITY, api.historyList);
  },
  async getWhitelist({ commit }, { whiteListOverApi }) {
    const url = whiteListOverApi ? WHITE_LIST_GITHUB_URL : '/whitelist.json';
    commit(types.GET_WHITELIST_REQUEST);
    try {
      const { data } = await axiosInstance.get(url);
      commit(types.GET_WHITELIST_SUCCESS, data);
    } catch (error) {
      commit(types.GET_WHITELIST_FAILURE);
    }
  },
  async getFiatPriceAndApyObject({ commit }) {
    commit(types.GET_FIAT_PRICE_AND_APY_OBJECT_REQUEST);
    try {
      const data = await SubqueryExplorerService.getFiatPriceAndApyObject();
      if (!data) {
        commit(types.GET_FIAT_PRICE_AND_APY_OBJECT_FAILURE);
        return;
      }
      commit(types.GET_FIAT_PRICE_AND_APY_OBJECT_SUCCESS, data);
    } catch (error) {
      commit(types.GET_FIAT_PRICE_AND_APY_OBJECT_FAILURE);
    }
  },

  subscribeOnFiatPriceAndApyObjectUpdates({ dispatch, state }) {
    dispatch('getFiatPriceAndApyObject');
    state.fiatPriceAndApyTimer = setInterval(() => {
      dispatch('getFiatPriceAndApyObject');
    }, HOUR);
  },

  resetFiatPriceAndApySubscription({ commit }) {
    commit(types.RESET_FIAT_PRICE_AND_APY_SUBSCRIPTION);
  },

  async getAccountReferralRewards({ commit }) {
    commit(types.GET_REFERRAL_REWARDS_REQUEST);
    try {
      const data = await SubqueryExplorerService.getAccountReferralRewards(state.address);
      if (!data) {
        commit(types.GET_REFERRAL_REWARDS_FAILURE);
        return;
      }
      commit(types.GET_REFERRAL_REWARDS_SUCCESS, data);
    } catch (error) {
      commit(types.GET_REFERRAL_REWARDS_FAILURE);
    }
  },

  async addAsset({ commit }, address: string) {
    commit(types.ADD_ASSET_REQUEST);
    try {
      await api.assets.getAccountAsset(address, true);
      commit(types.ADD_ASSET_SUCCESS);
    } catch (error) {
      commit(types.ADD_ASSET_FAILURE);
    }
  },
  getTransactionDetails({ commit }, id: string) {
    commit(types.SET_TRANSACTION_DETAILS_ID, id);
  },
  async transfer({ commit, getters: { currentRouteParams } }, { to, amount }) {
    commit(types.TRANSFER_REQUEST);
    const asset = currentRouteParams.asset as AccountAsset;
    try {
      await api.transfer(asset, to, amount);
      commit(types.TRANSFER_SUCCESS);
    } catch (error) {
      commit(types.TRANSFER_FAILURE);
      if (error.message.includes('Invalid decoded address')) {
        throw new Error('walletSend.errorAddress');
      }
      throw new Error(error.message);
    }
  },

  async syncWithStorage({ commit, state, getters, dispatch }) {
    const getAccountAssetsAddresses = () => Object.keys(getters.accountAssetsAddressTable);

    // previous state
    const { isLoggedIn: wasLoggedIn } = getters;
    const { address } = state;
    const prevAddresses = getAccountAssetsAddresses();

    commit(types.SYNC_WITH_STORAGE);

    // check log in/out state changes after sync
    if (getters.isLoggedIn !== wasLoggedIn || state.address !== address) {
      if (getters.isLoggedIn) {
        await dispatch('importPolkadotJs', state.address);
      } else {
        await dispatch('logout');
      }
    }

    // still logged in after sync
    if (getters.isLoggedIn && wasLoggedIn) {
      const currentAddresses = getAccountAssetsAddresses();
      // unique addresses size of two states
      const delta = new Set([...prevAddresses, ...currentAddresses]).size;

      // if asset(s) in api.accountAssets changed, we should update subscription
      if (prevAddresses.length !== delta || currentAddresses.length !== delta) {
        api.assets.updateAccountAssets();
      }
    }
  },
};

export default {
  types,
  state,
  getters,
  mutations,
  actions,
};
