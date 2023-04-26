import type { Wallet } from '@subwallet/wallet-connect/types';
import type { AccountAsset, Asset, Blacklist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription, Subject } from 'rxjs';

import type { Extensions } from '../../consts';
import type { PolkadotJsAccount, AddressKeyMapping, Book } from '../../types/common';
import type { ReferrerRewards, FiatPriceObject } from '../../services/subquery/types';

export type AccountState = {
  address: string;
  name: string;
  source: string;
  assets: Array<Asset>;
  assetsIds: Array<string>;
  assetsSubscription: Nullable<NodeJS.Timer | number>;
  accountAssets: Array<AccountAsset>;
  alertSubject: Nullable<Subject<FiatPriceObject>>;
  accountAssetsSubscription: Nullable<Subscription>;
  book: Nullable<Book>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  polkadotJsAccountsSubscription: Nullable<VoidFunction>;
  whitelistArray: Array<WhitelistArrayItem>;
  blacklistArray: Blacklist;
  fiatPriceObject: FiatPriceObject;
  fiatPriceSubscription: Nullable<VoidFunction>;
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
