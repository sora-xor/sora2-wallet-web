import type { NetworkFeesObject } from '@sora-substrate/util';

import { storage, runtimeStorage } from '../../util/storage';
import type { SettingsState } from './types';

function initialState(): SettingsState {
  return {
    apiKeys: {},
    subqueryEndpoint: null,
    isWalletLoaded: false, // wallet is loading
    permissions: {
      addAssets: true,
      addLiquidity: true,
      bridgeAssets: true,
      copyAssets: false,
      createAssets: true,
      sendAssets: true,
      swapAssets: true,
      showAssetDetails: true,
    },
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: Number(JSON.parse(runtimeStorage.get('version'))),
    runtimeVersionSubscription: null,
    systemEventsSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    shouldBalanceBeHidden: Boolean(JSON.parse(storage.get('shouldBalanceBeHidden'))) || false,
  };
}

const state = initialState();

export default state;
