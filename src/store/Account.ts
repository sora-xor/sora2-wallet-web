import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import fromPairs from 'lodash/fp/fromPairs';
import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import omit from 'lodash/fp/omit';
import { AES, enc } from 'crypto-js';
import cryptoRandomString from 'crypto-random-string';
import { axiosInstance, FPNumber } from '@sora-substrate/util';
import type { Subscription } from '@polkadot/x-rxjs';
import type { AccountAsset, Asset, Whitelist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { api } from '../api';
import { storage } from '../util/storage';
import {
  getExtension,
  getExtensionSigner,
  getExtensionInfo,
  getPolkadotJsAccounts,
  subscribeToPolkadotJsAccounts,
  toHashTable,
  WHITE_LIST_GITHUB_URL,
} from '../util';
import { SubqueryExplorerService } from '../services/subquery';
import type { AddressKeyMapping, FiatPriceAndApyObject, ReferrerRewards } from '../services/subquery/types';
import type { Account, PolkadotJsAccount, AccountAssetsTable } from '../types/common';

const HOUR = 60 * 60 * 1000;
const CHECK_EXTENSION_INTERVAL = 5 * 1000;
const PASSPHRASE_TIMEOUT = 1 * 60 * 1000; // 15min

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
    'SET_ACCOUNT_PASSPHRASE',
    'RESET_ACCOUNT_PASSPHRASE',
    'UPDATE_ADDRESS_GENERATED_KEY',
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
  passphraseAvailibiltyTimer: Nullable<NodeJS.Timeout>;
  addressKeyMapping: AddressKeyMapping;
  addressPassphraseMapping: AddressKeyMapping;
};

function initialState(): AccountState {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    isExternal: Boolean(JSON.parse(storage.get('isExternal'))) || false,
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
    passphraseAvailibiltyTimer: null,
    addressKeyMapping: {},
    addressPassphraseMapping: {},
  };
}

const state = initialState();

const getters = {
  passphrase(state: AccountState): string | null {
    const encryptedPassphrase = state.addressPassphraseMapping[state.address];
    const sessionKey = state.addressKeyMapping[state.address];

    if (encryptedPassphrase && sessionKey) {
      const decoded = AES.decrypt(encryptedPassphrase, sessionKey).toString(enc.Utf8);
      return decoded;
    }
    return null;
  },
  isLoggedIn(state: AccountState): boolean {
    return state.isExternal && !!state.address;
  },
  isExternal(state: AccountState): boolean {
    return state.isExternal;
  },
  isDesktop(state, getters, rootState): boolean {
    return rootState.Settings.isDesktop;
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
        'addressKeyMapping',
        'addressPassphraseMapping',
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
  },

  [types.UPDATE_ASSETS](state: AccountState, assets: Array<Asset>) {
    state.assets = assets;
  },

  [types.UPDATE_ACCOUNT_ASSETS](state: AccountState, assets: Array<AccountAsset>) {
    state.accountAssets = assets;
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

  [types.SET_EXTENSION_AVAILABILIY](state: AccountState, availability: boolean) {
    state.extensionAvailability = availability;
  },

  [types.RESET_EXTENSION_AVAILABILIY_SUBSCRIPTION](state: AccountState) {
    if (state.extensionAvailabilityTimer) {
      clearInterval(state.extensionAvailabilityTimer);
      state.extensionAvailabilityTimer = null;
    }
  },

  [types.SET_ACCOUNT_PASSPHRASE](state: AccountState, passphraseEncoded: string) {
    state.addressPassphraseMapping = {
      ...state.addressPassphraseMapping,
      [state.address]: passphraseEncoded,
    };
  },

  [types.UPDATE_ADDRESS_GENERATED_KEY](state: AccountState, key: string) {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: key,
    };
  },

  [types.RESET_ACCOUNT_PASSPHRASE](state: AccountState) {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: null,
    };
    state.addressPassphraseMapping = {
      ...state.addressPassphraseMapping,
      [state.address]: null,
    };
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
    await dispatch('subscribeOnAccountAssets');
    await dispatch('checkCurrentRoute', undefined, { root: true });
  },

  async logout({ commit, dispatch }) {
    if (api.accountPair) {
      api.logout(!!getters.isDesktop);
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

  async setAccountPassphrase({ commit }, passphrase: string) {
    const key = cryptoRandomString({ length: 10, type: 'ascii-printable' });
    const passphraseEncoded = AES.encrypt(passphrase, key).toString();

    commit(types.UPDATE_ADDRESS_GENERATED_KEY, key);
    commit(types.SET_ACCOUNT_PASSPHRASE, passphraseEncoded);

    const timer = setTimeout(() => {
      commit(types.RESET_ACCOUNT_PASSPHRASE);
      clearTimeout(timer);
    }, PASSPHRASE_TIMEOUT);
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

    if (getters.isLoggedIn && getters.isDesktop) {
      try {
        await dispatch('getSigner');
      } catch (error) {
        await dispatch('logout');
      }
    }
  },

  async getPolkadotJsAccounts({ dispatch }) {
    const accounts = await getPolkadotJsAccounts();
    await dispatch('updatePolkadotJsAccounts', accounts);
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

  async importPolkadotJsDesktop({ commit, dispatch, getters }, address: string) {
    commit(types.IMPORT_POLKADOT_JS_ACCOUNT_REQUEST);
    try {
      const defaultAddress = api.formatAddress(address, false);
      const account = getters.polkadotJsAccounts.find((acc) => acc.address === defaultAddress);

      if (!account) {
        commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE);
        throw new Error('polkadotjs.noAccount');
      }

      api.importByPolkadotJs(account.address, account.name, true);

      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_SUCCESS, account.name);
      await dispatch('afterLogin');
    } catch (error) {
      commit(types.IMPORT_POLKADOT_JS_ACCOUNT_FAILURE);
      throw new Error((error as Error).message);
    }
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

        await api.assets.updateAccountAssets();
      } catch (error) {
        commit(types.UPDATE_ACCOUNT_ASSETS, []);
      }
    }
  },

  resetAccountAssetsSubscription({ commit }) {
    commit(types.RESET_ACCOUNT_ASSETS_SUBSCRIPTION);
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
      await api.assets.addAccountAsset(address);
      commit(types.ADD_ASSET_SUCCESS);
    } catch (error) {
      commit(types.ADD_ASSET_FAILURE);
    }
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
    // previous state
    const { isLoggedIn: wasLoggedIn } = getters;
    const { address } = state;

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
      await api.assets.updateAccountAssets();
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
