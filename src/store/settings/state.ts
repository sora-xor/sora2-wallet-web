import { WalletAssetFilters, WalletFilteringOptions } from '@/consts';
import type { NetworkFeesObject } from '@sora-substrate/util';

import { storage, runtimeStorage, settingsStorage } from '../../util/storage';
import { ConnectionStatus } from '../../types/common';
import type { SettingsState } from './types';

function initialState(): SettingsState {
  const shouldBalanceBeHidden = storage.get('shouldBalanceBeHidden');
  const runtimeVersion = runtimeStorage.get('version');
  const filters = storage.get('filters');
  const allowFee = settingsStorage.get('allowFeePopup');
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
      option: option || WalletFilteringOptions.All,
      verifiedOnly: verifiedOnly || false,
      zeroBalance: zeroBalance || false,
    } as WalletAssetFilters,
    allowFeePopup: allowFee ? Boolean(JSON.parse(allowFee)) : true,
    soraNetwork: null,
    nftStorage: null,
    runtimeVersion: runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0,
    runtimeVersionSubscription: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    shouldBalanceBeHidden: shouldBalanceBeHidden ? Boolean(JSON.parse(shouldBalanceBeHidden)) : false,
  };
}

const state = initialState();

export default state;
