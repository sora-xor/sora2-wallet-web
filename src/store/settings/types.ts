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
  subqueryStatus: ConnectionStatus;
  permissions: WalletPermissions;
  filters: WalletAssetFilters;
  allowFeePopup: boolean;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
  runtimeVersion: number;
  runtimeVersionSubscription: Nullable<Subscription>;
  nftStorage: Nullable<NFTStorage>;
  subqueryEndpoint: Nullable<string>;
};
