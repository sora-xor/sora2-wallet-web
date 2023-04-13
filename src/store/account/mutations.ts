import { defineMutations } from 'direct-vuex';
import omit from 'lodash/fp/omit';
import type { Wallet } from '@subwallet/wallet-connect/types';
import type { Asset, AccountAsset, WhitelistArrayItem, Blacklist } from '@sora-substrate/util/build/assets/types';
import type { Subscription, Subject } from 'rxjs';
import type { Unsubcall } from '@polkadot/extension-inject/types';

import { EMPTY_REFERRAL_REWARDS, initialState } from './state';
import { storage } from '../../util/storage';
import { api } from '../../api';
import type { Extensions } from '../../consts';
import type { AccountState } from './types';
import type { FiatPriceObject, ReferrerRewards } from '../../services/subquery/types';
import type { PolkadotJsAccount } from '../../types/common';

const mutations = defineMutations<AccountState>()({
  // Fiat price
  setFiatPriceObject(state, object: FiatPriceObject): void {
    state.fiatPriceObject = object;
  },
  updateFiatPriceObject(state, fiatPriceAndApyRecord?: FiatPriceObject): void {
    if (!fiatPriceAndApyRecord) return;

    const updated = { ...(state.fiatPriceObject || {}), ...fiatPriceAndApyRecord };

    if (state.alertSubject) {
      state.alertSubject.next(updated);
    }

    state.fiatPriceObject = updated;
  },
  /** When fiat price and apy request has an error */
  clearFiatPriceObject(state): void {
    state.fiatPriceObject = {};
  },
  setAlertSubject(state, alertSubject: Subject<FiatPriceObject>) {
    state.alertSubject = alertSubject;
  },
  resetAlertSubscription(state) {
    if (state.alertSubject) {
      state.alertSubject.unsubscribe();
    }
    state.alertSubject = null;
  },
  setFiatPriceSubscription(state, subscription: VoidFunction): void {
    state.fiatPriceSubscription = subscription;
  },
  resetFiatPriceSubscription(state): void {
    if (state.fiatPriceSubscription) {
      state.fiatPriceSubscription();
    }
    state.fiatPriceSubscription = null;
  },
  resetAccount(state): void {
    const s = omit(
      [
        'whitelistArray',
        'blacklistArray',
        'fiatPriceObject',
        'fiatPriceSubscription',
        'poolApySubscription',
        'assets',
        'assetsIds',
        'assetsSubscription',
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
  setAssetsSubscription(state, timer: NodeJS.Timer | number): void {
    state.assetsSubscription = timer;
  },
  resetAssetsSubscription(state): void {
    if (state.assetsSubscription) {
      clearInterval(state.assetsSubscription as number);
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
  setAssetsIds(state, ids: string[]) {
    state.assetsIds = ids;
  },
  setAssets(state, assets: Array<Asset>): void {
    state.assets = assets;
  },
  setAccountAssets(state, accountAssets: Array<AccountAsset>): void {
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
  setNftBlacklist(state, blacklistArray: Blacklist): void {
    state.blacklistArray = blacklistArray;
  },
  clearWhitelist(state): void {
    state.whitelistArray = [];
  },
  clearBlacklist(state): void {
    state.blacklistArray = [];
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
  updateAddressGeneratedKey(state, key): void {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: key,
    };
  },
  resetAccountPassphrase(state): void {
    state.addressKeyMapping = {
      ...state.addressKeyMapping,
      [state.address]: null,
    };
    state.addressPassphraseMapping = {
      ...state.addressPassphraseMapping,
      [state.address]: null,
    };
  },
  setAccountPassphraseTimer(state, timer: NodeJS.Timeout): void {
    state.accountPassphraseTimer = timer;
  },
  resetAccountPassphraseTimer(state): void {
    if (state.accountPassphraseTimer) {
      clearTimeout(state.accountPassphraseTimer);
      state.accountPassphraseTimer = null;
    }
  },
  /** JUST FOR TESTING PURPOSES */
  setIsDesktop(state, value: boolean): void {
    state.isDesktop = value;
  },
});

export default mutations;
