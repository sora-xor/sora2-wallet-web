import type { NetworkFeesObject } from '@sora-substrate/util';
import type { NFTStorage } from 'nft.storage';
import type { Subscription } from 'rxjs';

import type { SoraNetwork, WalletPermissions } from '../../consts';
import type { ApiKeysObject } from '../../types/common';

export type SettingsState = {
  apiKeys: ApiKeysObject;
  isWalletLoaded: boolean;
  permissions: WalletPermissions;
  soraNetwork: Nullable<SoraNetwork>;
  networkFees: NetworkFeesObject;
  shouldBalanceBeHidden: boolean;
  runtimeVersion: number;
  runtimeVersionSubscription: Nullable<Subscription>;
  nftStorage: Nullable<NFTStorage>;
  subqueryEndpoint: Nullable<string>;
  isDesktop: boolean;
};
