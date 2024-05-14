import { AES, enc } from 'crypto-js';
import { defineGetters } from 'direct-vuex';
import isEqual from 'lodash/fp/isEqual';

import { api } from '../../api';
import { AppWallet } from '../../consts';
import { isInternalWallet } from '../../consts/wallets';
import { formatAccountAddress } from '../../util';

import { accountGetterContext } from './../account';

import type { AccountState } from './types';
import type { AssetsTable, AccountAssetsTable, PolkadotJsAccount } from '../../types/common';
import type { Asset, Whitelist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Wallet } from '@sora-test/wallet-connect/types';

const toHashTable = <T extends Asset>(list: Readonly<Array<T>>, key: string) => {
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
      source: state.source as AppWallet,
    };
  },
  wallets(...args): { internal: Wallet[]; external: Wallet[] } {
    const { state } = accountGetterContext(args);

    const wallets: { internal: Wallet[]; external: Wallet[] } = {
      internal: [], // api integrations, app signing
      external: [], // extensions
    };

    return state.availableWallets.reduce((buffer, wallet) => {
      if (isInternalWallet(wallet)) {
        buffer.internal.push(wallet);
      } else {
        buffer.external.push(wallet);
      }
      return buffer;
    }, wallets);
  },
  selectedWalletTitle(...args): string {
    const { state } = accountGetterContext(args);

    if (!state.selectedWallet) return '';

    const wallet = state.availableWallets.find((wallet) => wallet.extensionName === state.selectedWallet);

    return wallet ? wallet.title : state.selectedWallet;
  },
  assetsDataTable(...args): AssetsTable {
    const { state } = accountGetterContext(args);
    return toHashTable(state.assets, 'address');
  },
  accountAssetsAddressTable(...args): AccountAssetsTable {
    const { state } = accountGetterContext(args);
    return toHashTable(state.accountAssets, 'address');
  },
  whitelist(...args): Whitelist {
    const { state } = accountGetterContext(args);
    return state.whitelistArray && state.whitelistArray.length
      ? api.assets.getWhitelist(state.whitelistArray as WhitelistArrayItem[])
      : {};
  },
  whitelistIdsBySymbol(...args): any {
    const { state } = accountGetterContext(args);
    return state.whitelistArray && state.whitelistArray.length
      ? api.assets.getWhitelistIdsBySymbol(state.whitelistArray as WhitelistArrayItem[])
      : {};
  },
  passphrase(...args): Nullable<string> {
    const { state } = accountGetterContext(args);
    const encryptedPassphrase = state.addressPassphraseMapping[state.address];
    const sessionKey = state.addressKeyMapping[state.address];

    if (encryptedPassphrase && sessionKey) {
      const decoded = AES.decrypt(encryptedPassphrase, sessionKey).toString(enc.Utf8);
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
      const formatted = { ...account, address: formatAccountAddress(account.address) };
      const accountData: PolkadotJsAccount = { address, name };
      accountData.source = source as AppWallet;

      return isEqual(formatted)(accountData);
    };
  },
});

export default getters;
