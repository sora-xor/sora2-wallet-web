import isElectron from 'is-electron';
import { WalletAssetFilters } from '@/consts';
import type { NetworkFeesObject } from '@sora-substrate/util';

import { storage, runtimeStorage } from '../../util/storage';
import { ConnectionStatus } from '../../types/common';
import type { SettingsState } from './types';

function initialState(): SettingsState {
  const shouldBalanceBeHidden = storage.get('shouldBalanceBeHidden');
  const filters = storage.get('filters');
  const runtimeVersion = runtimeStorage.get('version');
  const { option, verifiedOnly, zeroBalance } = filters && JSON.parse(filters);

  return {
    apiKeys: {},
    subqueryEndpoint: null,
    subqueryStatus: ConnectionStatus.Unavailable,
    isWalletLoaded: false, // wallet is loading
    permissions: {
      addAssets: true,
      addLiquidity: true,
      bridgeAssets: true,
      createAssets: true,
      sendAssets: true,
      swapAssets: true,
      showAssetDetails: true,
    },
    filters: {
      option: option || 'All',
      verifiedOnly: verifiedOnly || false,
      zeroBalance: zeroBalance || false,
    } as WalletAssetFilters,
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0,
    runtimeVersionSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    isDesktop: isElectron(), // NOTE: inverse flag here to debug desktop
    shouldBalanceBeHidden: shouldBalanceBeHidden ? Boolean(JSON.parse(shouldBalanceBeHidden)) : false,
  };
}

const state = initialState();

export default state;
