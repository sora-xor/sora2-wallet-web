import { AppWallet } from '../../consts';

import type { Wallet } from '@subwallet/wallet-connect/types';
import type { AccountAsset, Asset, Blacklist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription } from 'rxjs';

import type { PolkadotJsAccount, AddressKeyMapping } from '../../types/common';
import type { ReferrerRewards, FiatPriceObject } from '../../services/subquery/types';

export type CreateAccountArgs = {
  seed: string;
  name: string;
  password: string;
  passwordConfirm?: string;
  saveAccount?: boolean;
  exportAccount?: boolean;
};

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
  fiatPriceObject: FiatPriceObject;
  fiatPriceSubscription: Nullable<VoidFunction>;
  referralRewards: ReferrerRewards;
  selectedWallet: Nullable<AppWallet>;
  availableWallets: Array<Wallet>;
  walletAvailabilityTimer: Nullable<NodeJS.Timeout | number>;
  addressKeyMapping: AddressKeyMapping;
  addressPassphraseMapping: AddressKeyMapping;
  assetsToNotifyQueue: Array<WhitelistArrayItem>;
  isDesktop: boolean;
  accountPassphraseTimer: Nullable<NodeJS.Timeout | number>;
};
