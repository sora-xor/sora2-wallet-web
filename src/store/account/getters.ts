import { defineGetters } from 'direct-vuex';
import CryptoJS from 'crypto-js';
import type { Blacklist, Whitelist } from '@sora-substrate/util/build/assets/types';

import { accountGetterContext } from './../account';
import { api } from '../../api';
import type { Extensions } from '../../consts';
import type { AccountState } from './types';
import type { AccountAssetsTable, PolkadotJsAccount } from '../../types/common';

const toHashTable = (list: Array<any>, key: string) => {
  return list.reduce((result, item) => {
    if (!(key in item)) return result;

    return { ...result, [item[key]]: item };
  }, {});
};

const getters = defineGetters<AccountState>()({
  isLoggedIn(state, getters): boolean {
    return (!!state.source && !!state.address) || (getters.isDesktop && !!state.address);
  },
  account(...args): PolkadotJsAccount {
    const { state } = accountGetterContext(args);
    return {
      address: state.address,
      name: state.name,
      source: state.source as Extensions,
    };
  },
  polkadotJsAccounts(...args): Array<PolkadotJsAccount> {
    const { state } = accountGetterContext(args);
    return state.polkadotJsAccounts;
  },
  accountAssetsAddressTable(...args): AccountAssetsTable {
    const { state } = accountGetterContext(args);
    return toHashTable(state.accountAssets, 'address');
  },
  whitelist(...args): Whitelist {
    const { state } = accountGetterContext(args);
    return state.whitelistArray && state.whitelistArray.length ? api.assets.getWhitelist(state.whitelistArray) : {};
  },
  whitelistIdsBySymbol(...args): any {
    const { state } = accountGetterContext(args);
    return state.whitelistArray && state.whitelistArray.length
      ? api.assets.getWhitelistIdsBySymbol(state.whitelistArray)
      : {};
  },
  passphrase(...args): string | null {
    const { state } = accountGetterContext(args);
    const encryptedPassphrase = state.addressPassphraseMapping[state.address];
    const sessionKey = state.addressKeyMapping[state.address];

    if (encryptedPassphrase && sessionKey) {
      const decoded = CryptoJS.AES.decrypt(encryptedPassphrase, sessionKey).toString(CryptoJS.enc.Utf8);
      return decoded;
    }
    return null;
  },
  isDesktop(state, getters, rootState): boolean {
    return rootState.wallet.settings.isDesktop;
  },
  blacklist(...args): any {
    const { state } = accountGetterContext(args);
    return state.blacklistArray && state.blacklistArray.length ? state.blacklistArray : [];
  },
});

export default getters;
