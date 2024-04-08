import isElectron from 'is-electron';

import type { Book } from '@/types/common';

import { storage, settingsStorage } from '../../util/storage';

import type { AccountState } from './types';
import type { AppWallet } from '../../consts';

export enum PassphraseTimeout {
  FIFTEEN_MINUTES = 15 * 60 * 1000,
  ONE_HOUR = 60 * 60 * 1000,
  FOUR_HOURS = 4 * 60 * 60 * 1000,
  ONE_DAY = 24 * 60 * 60 * 1000,
  UNLIMITED = Infinity,
}

export function initialState(): AccountState {
  const addressBook = settingsStorage.get('book');
  const ceresFiatValues = settingsStorage.get('ceresFiatValues');
  const book = addressBook && JSON.parse(addressBook);
  const isExternal = storage.get('isExternal');
  const passhraseTimeout = settingsStorage.get('passphareTimeout');

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
    accountAssetsSubscription: null,
    /** polkadot js accounts & subscription */
    polkadotJsAccounts: [],
    polkadotJsAccountsSubscription: null,
    /** whitelist & blacklist */
    whitelistArray: [],
    blacklistArray: [],
    /** fiat prices & subscription */
    fiatPriceObject: {},
    fiatPriceSubscription: null,
    ceresFiatValuesUsage: ceresFiatValues ? JSON.parse(ceresFiatValues) : false,
    /** extension management */
    selectedWallet: null,
    selectedWalletLoading: false,
    availableWallets: [],
    walletAvailabilityTimer: null,
    /** desktop key management */
    isDesktop: isElectron(), // NOTE: inverse flag here to debug desktop
    addressKeyMapping: {},
    addressPassphraseMapping: {},
    passhraseTimeout: passhraseTimeout ? JSON.parse(passhraseTimeout) : PassphraseTimeout.FIFTEEN_MINUTES,
    accountPassphraseTimer: null,
  };
}

const state = initialState();

export default state;
