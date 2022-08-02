import isElectron from 'is-electron';
import type { NetworkFeesObject } from '@sora-substrate/util';

import { storage, runtimeStorage } from '../../util/storage';
import type { SettingsState } from './types';

function initialState(): SettingsState {
  const shouldBalanceBeHidden = storage.get('shouldBalanceBeHidden');
  const runtimeVersion = runtimeStorage.get('version');
  return {
    apiKeys: {},
    subqueryEndpoint: null,
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
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0,
    runtimeVersionSubscription: null,
    systemEventsSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    isDesktop: isElectron(),
    shouldBalanceBeHidden: shouldBalanceBeHidden ? Boolean(JSON.parse(shouldBalanceBeHidden)) : false,
  };
}

const state = initialState();

export default state;
