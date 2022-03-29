import { defineGetters } from 'direct-vuex';
import type { Whitelist } from '@sora-substrate/util/build/assets/types';

import { accountGetterContext } from './../account';
import { api } from '../../api';
import type { AccountState } from './types';
import type { Account, AccountAssetsTable } from '../../types/common';

const toHashTable = (list: Array<any>, key: string) => {
  return list.reduce((result, item) => {
    if (!(key in item)) return result;

    return { ...result, [item[key]]: item };
  }, {});
};

const getters = defineGetters<AccountState>()({
  isLoggedIn(...args): boolean {
    const { state } = accountGetterContext(args);
    return state.isExternal && !!state.address;
  },
  account(...args): Account {
    const { state } = accountGetterContext(args);
    return {
      address: state.address,
      name: state.name,
      isExternal: state.isExternal,
    };
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
});

export default getters;
