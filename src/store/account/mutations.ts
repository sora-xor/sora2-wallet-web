import { defineMutations } from 'direct-vuex';
import omit from 'lodash/fp/omit';
import Vue from 'vue';

import { api } from '../../api';
import { storage, settingsStorage } from '../../util/storage';

import { initialState } from './state';

import type { AccountState } from './types';
import type { AppWallet } from '../../consts';
import type { FiatPriceObject } from '../../services/indexer/types';
import type { Book, PolkadotJsAccount } from '../../types/common';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Asset, AccountAsset, WhitelistArrayItem, Blacklist } from '@sora-substrate/util/build/assets/types';
import type { Wallet } from '@sora-test/wallet-connect/types';
import type { Subscription, Subject } from 'rxjs';

const mutations = defineMutations<AccountState>()({
  // Fiat price
  setFiatPriceObject(state, object: FiatPriceObject): void {
    state.fiatPriceObject = Object.freeze(object);
  },
  updateFiatPriceObject(state, fiatPriceAndApyRecord?: FiatPriceObject): void {
    if (!fiatPriceAndApyRecord) return;

    const updated = Object.freeze({ ...(state.fiatPriceObject || {}), ...fiatPriceAndApyRecord });

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
    state.fiatPriceSubscription?.();
    state.fiatPriceSubscription = null;
  },
  setCeresFiatValuesUsage(state, flag): void {
    state.ceresFiatValuesUsage = flag;
    settingsStorage.set('ceresFiatValues', flag);
  },
  resetAccount(state): void {
    const s = omit(
      [
        'whitelistArray',
        'blacklistArray',
        'fiatPriceObject',
        'fiatPriceSubscription',
        'assets',
        'assetsSubscription',
        'polkadotJsAccounts',
        'polkadotJsAccountsSubscription',
        'selectedWallet',
        'availableWallets',
        'walletAvailabilityTimer',
      ],
      initialState()
    );
    Object.keys(s).forEach((key) => {
      state[key] = s[key];
    });
  },
  setAssetsSubscription(state, subscription: VoidFunction): void {
    state.assetsSubscription = subscription;
  },
  resetAssetsSubscription(state): void {
    state.assetsSubscription?.();
    state.assetsSubscription = null;
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
    const isExternal = storage.get('isExternal');

    state.address = storage.get('address');
    state.name = storage.get('name');
    state.source = storage.get('source') as AppWallet;
    state.isExternal = isExternal ? JSON.parse(isExternal) : false;
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
    state.whitelistArray = Object.freeze(whitelistArray);
  },
  setNftBlacklist(state, blacklistArray: Blacklist): void {
    state.blacklistArray = Object.freeze(blacklistArray);
  },
  clearWhitelist(state): void {
    state.whitelistArray = [];
  },
  clearBlacklist(state): void {
    state.blacklistArray = [];
  },
  setWalletAccounts(state, polkadotJsAccounts: Array<PolkadotJsAccount> = []): void {
    state.polkadotJsAccounts = polkadotJsAccounts;
  },
  setWalletAccountsSubscription(state, subscription: Nullable<Unsubcall>): void {
    state.polkadotJsAccountsSubscription = subscription;
  },
  resetWalletAccountsSubscription(state): void {
    if (typeof state.polkadotJsAccountsSubscription === 'function') {
      state.polkadotJsAccountsSubscription();
    }
    state.polkadotJsAccountsSubscription = null;
  },
  setAvailableWallets(state, wallets: Wallet[]) {
    state.availableWallets = wallets;
  },
  setSelectedWallet(state, extension: Nullable<AppWallet> = null) {
    state.selectedWallet = extension;
  },
  setSelectedWalletLoading(state, flag: boolean) {
    state.selectedWalletLoading = flag;
  },
  setWalletAvailabilitySubscription(state, timeout: NodeJS.Timeout | number): void {
    state.walletAvailabilityTimer = timeout;
  },
  resetWalletAvailabilitySubscription(state): void {
    if (state.walletAvailabilityTimer) {
      clearInterval(state.walletAvailabilityTimer as number);
      state.walletAvailabilityTimer = null;
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
  setAddressToBook(state, { address, name }: PolkadotJsAccount): void {
    const addressBook = { ...state.book, [address]: name };
    state.book = addressBook as Book;
    settingsStorage.set('book', JSON.stringify(addressBook));
  },
  removeAddressFromBook(state, address: string): void {
    if (state.book) {
      Vue.delete(state.book, address); // to make it reactive
      settingsStorage.set('book', JSON.stringify(state.book));
    }
  },
});

export default mutations;
