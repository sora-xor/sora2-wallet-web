import type { Wallet } from '@subwallet/wallet-connect/types';
import type { AccountAsset, Asset, Blacklist, WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { Subscription, Subject } from 'rxjs';

import type { AppWallet } from '../../consts';
import type { PolkadotJsAccount, AddressKeyMapping, KeyringPair$Json, Book } from '../../types/common';
import type { ReferrerRewards, FiatPriceObject } from '../../services/subquery/types';

export type CreateAccountArgs = {
  seed: string;
  name: string;
  password: string;
  passwordConfirm?: string;
  saveAccount?: boolean;
  exportAccount?: boolean;
};

export type RestoreAccountArgs = {
  json: KeyringPair$Json;
  password: string;
};

export type AccountState = {
  address: string;
  name: string;
  source: string;
  isExternal: boolean;
  assets: Readonly<Asset[]>;
  assetsIds: Readonly<string[]>;
  assetsSubscription: Nullable<NodeJS.Timer | number>;
  accountAssets: Array<AccountAsset>;
  alertSubject: Nullable<Subject<FiatPriceObject>>;
  accountAssetsSubscription: Nullable<Subscription>;
  book: Nullable<Book>;
  polkadotJsAccounts: Array<PolkadotJsAccount>;
  polkadotJsAccountsSubscription: Nullable<VoidFunction>;
  whitelistArray: Readonly<WhitelistArrayItem[]>;
  blacklistArray: Readonly<Blacklist>;
  fiatPriceObject: Readonly<FiatPriceObject>;
  fiatPriceSubscription: Nullable<VoidFunction>;
  referralRewards: ReferrerRewards;
  selectedWallet: Nullable<AppWallet>;
  selectedWalletLoading: boolean;
  availableWallets: Array<Wallet>;
  walletAvailabilityTimer: Nullable<NodeJS.Timeout | number>;
  addressKeyMapping: AddressKeyMapping;
  addressPassphraseMapping: AddressKeyMapping;
  assetsToNotifyQueue: Array<WhitelistArrayItem>;
  isDesktop: boolean;
  accountPassphraseTimer: Nullable<NodeJS.Timeout | number>;
};
