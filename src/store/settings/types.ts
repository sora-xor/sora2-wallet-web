import type { NetworkFeesObject } from '@sora-substrate/util';
import type { NFTStorage } from 'nft.storage';
import type { Subscription } from 'rxjs';

import type { SoraNetwork, WalletPermissions, WalletAssetFilters } from '../../consts';
import type { ApiKeysObject, ConnectionStatus } from '../../types/common';

export type SettingsState = {
  apiKeys: ApiKeysObject;
  isWalletLoaded: boolean;
  subqueryStatus: ConnectionStatus;
  permissions: WalletPermissions;
  filters: WalletAssetFilters;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
  runtimeVersion: number;
  runtimeVersionSubscription: Nullable<Subscription>;
  nftStorage: Nullable<NFTStorage>;
  subqueryEndpoint: Nullable<string>;
};
