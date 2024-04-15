import { IndexerType } from '@/consts';

import type { SoraNetwork, WalletPermissions, WalletAssetFilters } from '../../consts';
import type { Alert, ApiKeysObject, IndexerState } from '../../types/common';
import type { Currency, FiatExchangeRateObject } from '../../types/currency';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { NFTStorage } from 'nft.storage';
import type { Subscription } from 'rxjs';

export type SettingsState = {
  apiKeys: ApiKeysObject;
  alerts: Array<Alert>;
  allowTopUpAlert: boolean;
  isWalletLoaded: boolean;
  indexerType: IndexerType;
  indexers: Record<IndexerType, IndexerState>;
  permissions: WalletPermissions;
  filters: WalletAssetFilters;
  allowFeePopup: boolean;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
  feeMultiplier: number;
  runtimeVersion: number;
  feeMultiplierAndRuntimeSubscriptions: Nullable<Subscription>;
  nftStorage: Nullable<NFTStorage>;
  currency: Currency;
  fiatExchangeRateObject: FiatExchangeRateObject;
  exchangeRateSubscription: Nullable<VoidFunction>;
};
