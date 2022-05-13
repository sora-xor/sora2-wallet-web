import { defineMutations } from 'direct-vuex';
import omit from 'lodash/fp/omit';
import type { Asset, AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from '@polkadot/x-rxjs';

import { EMPTY_REFERRAL_REWARDS, initialState } from './state';
import { storage } from '../../util/storage';
import { api } from '../../api';
import type { AccountState } from './types';
import type { FiatPriceAndApyObject, ReferrerRewards } from '../../services/subquery/types';
import type { PolkadotJsAccount, Extensions } from '../../types/common';

const mutations = defineMutations<AccountState>()({
  setFiatPriceAndApyTimer(state, timer: NodeJS.Timer | number): void {
    state.fiatPriceAndApyTimer = timer;
  },
  resetFiatPriceAndApySubscription(state): void {
    if (state.fiatPriceAndApyTimer) {
      clearInterval(state.fiatPriceAndApyTimer as number);
      state.fiatPriceAndApyTimer = null;
    }
  },
  resetAccount(state): void {
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
  setAssetsSubscription(state, subscription: Subscription): void {
    state.assetsSubscription = subscription;
  },
  resetAssetsSubscription(state): void {
    if (state.assetsSubscription) {
      state.assetsSubscription.unsubscribe();
      state.assetsSubscription = null;
    }
  },
  setAccountAssetsSubscription(state, subscription: Subscription): void {
    state.accountAssetsSubscription = subscription;
  },
  resetAccountAssetsSubscription(state): void {
    api.assets.clearAccountAssets();
    if (state.accountAssetsSubscription) {
      state.accountAssetsSubscription.unsubscribe();
      state.accountAssetsSubscription = null;
    }
  },
  syncWithStorage(state): void {
    state.address = storage.get('address') || '';
    state.name = storage.get('name') || '';
    state.isExternal = Boolean(storage.get('isExternal')) || false;
  },
  updateAssets(state, assets: Array<Asset>): void {
    state.assets = assets;
  },
  updateAccountAssets(state, accountAssets: Array<AccountAsset>): void {
    state.accountAssets = accountAssets;
  },
  setWhitelist(state, whitelistArray: Array<WhitelistArrayItem>): void {
    state.whitelistArray = whitelistArray;
  },
  clearWhitelist(state): void {
    state.whitelistArray = [];
  },
  setFiatPriceAndApyObject(state, object: FiatPriceAndApyObject): void {
    state.fiatPriceAndApyObject = object;
    state.withoutFiatAndApy = false;
  },
  /** When fiat price and apy request has an error */
  clearFiatPriceAndApyObject(state): void {
    state.fiatPriceAndApyObject = {};
    state.withoutFiatAndApy = true;
  },
  setReferralRewards(state, referralRewards: ReferrerRewards): void {
    state.referralRewards = referralRewards;
  },
  clearReferralRewards(state): void {
    state.referralRewards = EMPTY_REFERRAL_REWARDS;
  },
  setPolkadotJsAccounts(state, polkadotJsAccounts: Array<PolkadotJsAccount>): void {
    state.polkadotJsAccounts = polkadotJsAccounts;
  },
  setPolkadotJsAccountsSubscription(state, subscription: VoidFunction): void {
    state.polkadotJsAccountsSubscription = subscription;
  },
  resetPolkadotJsAccountsSubscription(state): void {
    state.polkadotJsAccounts = [];
    if (typeof state.polkadotJsAccountsSubscription === 'function') {
      state.polkadotJsAccountsSubscription();
    }
    state.polkadotJsAccountsSubscription = null;
  },
  selectPolkadotJsAccount(state, name: string): void {
    state.address = api.address;
    state.name = name;
    state.isExternal = true;
  },
  setExtensionAvailability(state, availability: boolean): void {
    state.extensionAvailability = availability;
  },
  setExtensionAvailabilitySubscription(state, timeout: NodeJS.Timeout | number): void {
    state.extensionAvailabilityTimer = timeout;
  },
  resetExtensionAvailabilitySubscription(state): void {
    if (state.extensionAvailabilityTimer) {
      clearInterval(state.extensionAvailabilityTimer as number);
      state.extensionAvailabilityTimer = null;
    }
    state.polkadotJsAccounts = [];
    if (typeof state.polkadotJsAccountsSubscription === 'function') {
      state.polkadotJsAccountsSubscription();
    }
    state.polkadotJsAccountsSubscription = null;
  },
});

export default mutations;
