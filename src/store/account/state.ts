import isElectron from 'is-electron';

import type { Book } from '@/types/common';

import { DefaultPassphraseTimeout } from '../../consts';
import { storage, settingsStorage } from '../../util/storage';

import type { AccountState } from './types';
import type { AppWallet } from '../../consts';

export function initialState(): AccountState {
  const addressBook = settingsStorage.get('book');
  const ceresFiatValues = settingsStorage.get('ceresFiatValues');
  const book = addressBook && JSON.parse(addressBook);
  const isExternal = storage.get('isExternal');
  const pinnedAssetsString = storage.get('pinnedAssets');
  const pinnedAssets = pinnedAssetsString ? JSON.parse(pinnedAssetsString) : [];
  const accountPasswordTimeout = settingsStorage.get('accountPasswordTimeout');

  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    source: (storage.get('source') as AppWallet) || '',
    isExternal: isExternal ? JSON.parse(isExternal) : false,
    assets: [],
    assetsToNotifyQueue: [],
    assetsSubscription: null,
    book: (book || {}) as Book,
    alertSubject: null,
    /** account assets & subscription */
    accountAssets: [],
    pinnedAssets: pinnedAssets || [],
    accountAssetsSubscription: null,
    /** whitelist & blacklist */
    whitelistArray: [],
    blacklistArray: [],
    /** fiat prices & subscription */
    fiatPriceObject: {},
    fiatPriceSubscription: null,
    ceresFiatValuesUsage: ceresFiatValues ? JSON.parse(ceresFiatValues) : false,
    /** extension management */
    availableWallets: [],
    /** desktop key management */
    isDesktop: isElectron(), // NOTE: inverse flag here to debug desktop
    addressKeyMapping: {},
    addressPassphraseMapping: {},
    /** account password timings  */
    accountPasswordTimer: {},
    accountPasswordTimestamp: {},
    accountPasswordTimeout: accountPasswordTimeout ? JSON.parse(accountPasswordTimeout) : DefaultPassphraseTimeout,
  };
}

const state = initialState();

export default state;
