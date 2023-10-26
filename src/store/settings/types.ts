import { IndexerType } from '@/consts';

import type { SoraNetwork, WalletPermissions, WalletAssetFilters } from '../../consts';
import type { Alert, ApiKeysObject, ConnectionStatus } from '../../types/common';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { NFTStorage } from 'nft.storage';
import type { Subscription } from 'rxjs';

export type IndexerState = {
  endpoint: Nullable<string>;
  status: ConnectionStatus;
};

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
};
