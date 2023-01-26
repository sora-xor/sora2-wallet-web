import { defineGetters } from 'direct-vuex';
import CryptoJS from 'crypto-js';
import isEqual from 'lodash/fp/isEqual';
import type { Whitelist } from '@sora-substrate/util/build/assets/types';

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
  isLoggedIn(...args): boolean {
    const { state } = accountGetterContext(args);
    return !!state.address && (state.isDesktop || !!state.source);
  },
  account(...args): PolkadotJsAccount {
    const { state } = accountGetterContext(args);
    return {
      address: state.address,
      name: state.name,
      source: state.source as Extensions,
    };
  },
  selectedWalletTitle(...args): string {
    const { state } = accountGetterContext(args);

    if (!state.selectedExtension) return '';

    const wallet = state.availableWallets.find((wallet) => wallet.extensionName === state.selectedExtension);

    return wallet ? wallet.title : state.selectedExtension;
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
  passphrase(...args): Nullable<string> {
    const { state } = accountGetterContext(args);
    const encryptedPassphrase = state.addressPassphraseMapping[state.address];
    const sessionKey = state.addressKeyMapping[state.address];

    if (encryptedPassphrase && sessionKey) {
      const decoded = CryptoJS.AES.decrypt(encryptedPassphrase, sessionKey).toString(CryptoJS.enc.Utf8);
      return decoded;
    }
    return null;
  },
  blacklist(...args): any {
    const { state } = accountGetterContext(args);
    return state.blacklistArray && state.blacklistArray.length ? state.blacklistArray : [];
  },
  isConnectedAccount(...args) {
    const { state } = accountGetterContext(args);

    return (account: PolkadotJsAccount): boolean => {
      const { address, name, source } = state;
      const formatted = { ...account, address: api.formatAddress(account.address) };
      return isEqual(formatted)({ address, name, source });
    };
  },
});

export default getters;
