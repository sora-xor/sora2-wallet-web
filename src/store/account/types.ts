import { Extensions } from '../../consts';

import type { Wallet } from '@subwallet/wallet-connect/types';
import type { FiatPriceAndApyObject, ReferrerRewards } from '@/services/subquery/types';
import type { AccountAsset, Asset, Blacklist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from 'rxjs';

import type { PolkadotJsAccount, AddressKeyMapping } from '../../types/common';

export type AccountState = {
  address: string;
  name: string;
  source: string;
  assets: Array<Asset>;
  assetsIds: Array<string>;
  assetsSubscription: Nullable<NodeJS.Timer | number>;
  accountAssets: Array<AccountAsset>;
  accountAssetsSubscription: Nullable<Subscription>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  polkadotJsAccountsSubscription: Nullable<VoidFunction>;
  whitelistArray: Array<WhitelistArrayItem>;
  blacklistArray: Blacklist;
  withoutFiatAndApy: boolean;
  fiatPriceAndApyObject: Nullable<FiatPriceAndApyObject>;
  fiatPriceAndApySubscription: Nullable<VoidFunction>;
  referralRewards: ReferrerRewards;
  selectedExtension: Nullable<Extensions>;
  availableWallets: Array<Wallet>;
  extensionAvailabilityTimer: Nullable<NodeJS.Timeout | number>;
  addressKeyMapping: AddressKeyMapping;
  addressPassphraseMapping: AddressKeyMapping;
  assetsToNotifyQueue: Array<WhitelistArrayItem>;
  isDesktop: boolean;
  accountPassphraseTimer: Nullable<NodeJS.Timeout | number>;
};
