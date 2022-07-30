import { defineMutations } from 'direct-vuex';
import omit from 'lodash/fp/omit';
import type { Wallet } from '@subwallet/wallet-connect/types';
import type { Asset, AccountAsset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from 'rxjs';
import type { Unsubcall } from '@polkadot/extension-inject/types';

import { EMPTY_REFERRAL_REWARDS, initialState } from './state';
import { storage } from '../../util/storage';
import { api } from '../../api';
import { Extensions } from '../../consts';

import type { AccountState } from './types';
import type { FiatPriceAndApyObject, ReferrerRewards } from '../../services/subquery/types';
import type { PolkadotJsAccount } from '../../types/common';

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
        'selectedExtension',
        'availableWallets',
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
    state.source = storage.get('source') || '';
  },
  updateAssets(state, assets: Array<Asset>): void {
    state.assets = assets;
  },
  updateAccountAssets(state, accountAssets: Array<AccountAsset>): void {
    state.accountAssets = accountAssets;
  },
  setAssetToNotify(state, asset: WhitelistArrayItem): void {
    state.assetsToNotifyQueue.push(asset);
  },
  popAssetFromNotificationQueue(state): void {
    state.assetsToNotifyQueue.shift();
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
  setPolkadotJsAccountsSubscription(state, subscription: Nullable<Unsubcall>): void {
    state.polkadotJsAccountsSubscription = subscription;
  },
  resetPolkadotJsAccountsSubscription(state): void {
    if (typeof state.polkadotJsAccountsSubscription === 'function') {
      state.polkadotJsAccountsSubscription();
    }
    state.polkadotJsAccountsSubscription = null;
  },
  selectPolkadotJsAccount(state, { name = '', source = '' } = {}): void {
    state.address = api.address;
    state.source = source;
    state.name = name;
  },
  setAvailableWallets(state, wallets: Wallet[]) {
    state.availableWallets = wallets;
  },
  setSelectedExtension(state, extension: Extensions) {
    state.selectedExtension = extension;
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
  setAccountPassphrase(state, passphraseEncoded): void {
    state.addressPassphraseMapping = {
      ...state.addressPassphraseMapping,
      [state.address]: passphraseEncoded,
    };
  },
  updateAddressGeneratedKey(state, key) {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: key,
    };
  },
  resetAccountPassphrase(state: AccountState) {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: null,
    };
    state.addressPassphraseMapping = {
      ...state.addressPassphraseMapping,
      [state.address]: null,
    };
  },
});

export default mutations;
