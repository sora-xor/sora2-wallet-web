import { FPNumber } from '@sora-substrate/util';

import { storage } from '../../util/storage';
import type { ReferrerRewards } from '../../services/subquery/types';
import type { AccountState } from './types';

export const EMPTY_REFERRAL_REWARDS: ReferrerRewards = {
  rewards: FPNumber.ZERO,
  invitedUserRewards: {},
};

export function initialState(): AccountState {
  return {
    address: storage.get('address') || '',
    name: storage.get('name') || '',
    isExternal: Boolean(JSON.parse(storage.get('isExternal'))) || false,
    assets: [],
    assetsSubscription: null,
    /** account assets & subscription */
    accountAssets: [],
    accountAssetsSubscription: null,
    /** polkadot js accounts & subscription */
    polkadotJsAccounts: [],
    polkadotJsAccountsSubscription: null,
    whitelistArray: [],
    withoutFiatAndApy: false,
    fiatPriceAndApyObject: {},
    fiatPriceAndApyTimer: null,
    referralRewards: EMPTY_REFERRAL_REWARDS,
    extensionAvailability: false,
    extensionAvailabilityTimer: null,
  };
}

const state = initialState();

export default state;