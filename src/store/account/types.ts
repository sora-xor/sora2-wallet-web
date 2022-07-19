import { Extensions } from '../../consts';

import type { Wallet } from '@subwallet/wallet-connect/types';
import type { FiatPriceAndApyObject, ReferrerRewards } from '@/services/subquery/types';
import type { AccountAsset, Asset, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from 'rxjs';

import type { PolkadotJsAccount } from '../../types/common';

export type AccountState = {
  address: string;
  name: string;
  source: string;
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
  selectedExtension: Nullable<Extensions>;
  availableWallets: Array<Wallet>;
  extensionAvailabilityTimer: Nullable<NodeJS.Timeout | number>;
  assetsToNotifyQueue: Array<WhitelistArrayItem>;
};
