import type { FiatPriceAndApyObject, ReferrerRewards } from '@/services/subquery/types';
import type { AccountAsset, Asset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from '@polkadot/x-rxjs';

import type { Extensions, PolkadotJsAccount } from '../../types/common';

export type AccountState = {
  address: string;
  name: string;
  isExternal: boolean;
  assets: Array<Asset>;
  assetsSubscription: Nullable<Subscription>;
  accountAssets: Array<AccountAsset>;
  accountAssetsSubscription: Nullable<Subscription>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  polkadotJsAccountsSubscription: Nullable<VoidFunction>;
  whitelistArray: Array<WhitelistArrayItem>;
  withoutFiatAndApy: boolean;
  fiatPriceAndApyObject: Nullable<FiatPriceAndApyObject>;
  fiatPriceAndApyTimer: Nullable<NodeJS.Timer | number>;
  referralRewards: ReferrerRewards;
  availableExtensions: Array<Extensions>;
  extensionAvailabilityTimer: Nullable<NodeJS.Timeout | number>;
};
