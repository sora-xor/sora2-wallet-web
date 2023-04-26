import isElectron from 'is-electron';
import { FPNumber } from '@sora-substrate/util';

import { storage } from '../../util/storage';
import type { ReferrerRewards } from '../../services/subquery/types';
import type { AccountState } from './types';
import type { Book } from '@/types/common';

export const EMPTY_REFERRAL_REWARDS: ReferrerRewards = {
  rewards: FPNumber.ZERO,
  invitedUserRewards: {},
};

export function initialState(): AccountState {
  const addressBook = storage.get('book');
  const book = addressBook && JSON.parse(addressBook);

  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    source: storage.get('source') || '',
    assets: [],
    assetsIds: [],
    assetsToNotifyQueue: [],
    assetsSubscription: null,
    book: (book || {}) as Book,
    /** account assets & subscription */
    accountAssets: [],
    accountAssetsSubscription: null,
    /** polkadot js accounts & subscription */
    polkadotJsAccounts: [],
    polkadotJsAccountsSubscription: null,
    whitelistArray: [],
    blacklistArray: [],
    fiatPriceObject: {},
    fiatPriceSubscription: null,
    referralRewards: EMPTY_REFERRAL_REWARDS,
    /** extension management */
    selectedExtension: null,
    availableWallets: [],
    extensionAvailabilityTimer: null,
    /** desktop key management */
    isDesktop: isElectron(), // NOTE: inverse flag here to debug desktop
    addressKeyMapping: {},
    addressPassphraseMapping: {},
    accountPassphraseTimer: null,
  };
}

const state = initialState();

export default state;
