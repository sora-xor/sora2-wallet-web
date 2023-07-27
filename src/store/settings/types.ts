import IndexerType from '@/types/indexer';

import type { SoraNetwork, WalletPermissions, WalletAssetFilters } from '../../consts';
import type { Alert, ApiKeysObject, ConnectionStatus } from '../../types/common';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { NFTStorage } from 'nft.storage';
import type { Subscription } from 'rxjs';

export type SettingsState = {
  apiKeys: ApiKeysObject;
  alerts: Array<Alert>;
  allowTopUpAlert: boolean;
  isWalletLoaded: boolean;
  indexerType: IndexerType;
  subqueryEndpoint: Nullable<string>;
  subsquidEndpoint: Nullable<string>;
  subqueryStatus: ConnectionStatus;
  subsquidStatus: ConnectionStatus;
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
