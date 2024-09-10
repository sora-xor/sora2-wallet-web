import type { AppWallet } from '../../consts';
import type { FiatPriceObject } from '../../services/indexer/subsquid/types';
import type { Book, PolkadotJsAccount, AddressKeyMapping, KeyringPair$Json } from '../../types/common';
import type { AccountAsset, Asset, Blacklist, WhitelistArrayItem } from '@sora-substrate/sdk/build/assets/types';
import type { Wallet } from '@sora-test/wallet-connect/types';
import type { Subscription, Subject } from 'rxjs';

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
  source: AppWallet;
  isExternal: boolean;
  assets: Readonly<Asset[]>;
  assetsSubscription: Nullable<VoidFunction>;
  accountAssets: Array<AccountAsset>;
  alertSubject: Nullable<Subject<FiatPriceObject>>;
  accountAssetsSubscription: Nullable<Subscription>;
  book: Nullable<Book>;
  whitelistArray: Readonly<WhitelistArrayItem[]>;
  blacklistArray: Readonly<Blacklist>;
  fiatPriceObject: Readonly<FiatPriceObject>;
  fiatPriceSubscription: Nullable<VoidFunction>;
  ceresFiatValuesUsage: boolean;
  availableWallets: Array<Wallet>;
  addressKeyMapping: AddressKeyMapping;
  addressPassphraseMapping: AddressKeyMapping;
  assetsToNotifyQueue: Array<WhitelistArrayItem>;
  isDesktop: boolean;
  accountPasswordTimer: Record<string, Nullable<NodeJS.Timeout>>;
  accountPasswordTimestamp: Record<string, Nullable<number>>;
  accountPasswordTimeout: number;
};
