import { FPNumber } from '@sora-substrate/util';
import isElectron from 'is-electron';

import type { Book } from '@/types/common';

import { storage, settingsStorage } from '../../util/storage';

import type { AppWallet } from '../../consts';
import type { ReferrerRewards } from '../../services/subquery/types';
import type { AccountState } from './types';

export const EMPTY_REFERRAL_REWARDS: ReferrerRewards = {
  rewards: FPNumber.ZERO,
  invitedUserRewards: {},
};

const isExternal = storage.get('isExternal');

export function initialState(): AccountState {
  const addressBook = settingsStorage.get('book');
  const book = addressBook && JSON.parse(addressBook);

  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    source: (storage.get('source') as AppWallet) || '',
    isExternal: isExternal ? JSON.parse(isExternal) : false,
    assets: [],
    assetsIds: [],
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
    referralRewards: EMPTY_REFERRAL_REWARDS,
    /** extension management */
    selectedWallet: null,
    selectedWalletLoading: false,
    availableWallets: [],
    walletAvailabilityTimer: null,
    /** desktop key management */
    isDesktop: isElectron(), // NOTE: inverse flag here to debug desktop
    addressKeyMapping: {},
    addressPassphraseMapping: {},
    accountPassphraseTimer: null,
  };
}

const state = initialState();

export default state;
