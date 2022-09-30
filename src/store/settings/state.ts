import isElectron from 'is-electron';
import { WalletAssetFilters } from '@/consts';
import type { NetworkFeesObject } from '@sora-substrate/util';

import { storage, runtimeStorage } from '../../util/storage';
import type { SettingsState } from './types';

function initialState(): SettingsState {
  const shouldBalanceBeHidden = storage.get('shouldBalanceBeHidden');
  const runtimeVersion = runtimeStorage.get('version');

  // CHECKME: Uncomment or remove this functionality depending on user's feedback
  // to save setting preferences.
  // const filters = settingsStorage.get('filters');
  // const { option, verifiedOnly, zeroBalance } = filters && JSON.parse(filters);

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
    filters: {
      // CHECKME: Uncomment or remove this functionality depending on user's feedback
      // to save setting preferences.
      option: 'All', // option || 'All'
      verifiedOnly: false, // verifiedOnly || false,
      zeroBalance: false, // zeroBalance || false
    } as WalletAssetFilters,
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0,
    runtimeVersionSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    isDesktop: !isElectron(), // NOTE: inverse flag here to debug desktop
    shouldBalanceBeHidden: shouldBalanceBeHidden ? Boolean(JSON.parse(shouldBalanceBeHidden)) : false,
  };
}

const state = initialState();

export default state;
