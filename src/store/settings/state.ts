import { WalletAssetFilters, WalletFilteringOptions, IndexerType } from '../../consts';
import { Alert, ConnectionStatus } from '../../types/common';
import { storage, runtimeStorage, settingsStorage } from '../../util/storage';

import type { SettingsState } from './types';
import type { NetworkFeesObject } from '@sora-substrate/util';

function initialState(): SettingsState {
  const priceAlerts = settingsStorage.get('alerts');
  const alerts = priceAlerts && JSON.parse(priceAlerts);
  const allowTopUpAlerts = settingsStorage.get('allowTopUpAlerts');
  const shouldBalanceBeHidden = storage.get('shouldBalanceBeHidden');
  const feeMultiplier = runtimeStorage.get('feeMultiplier');
  const indexerType = storage.get('indexerType');
  const runtimeVersion = runtimeStorage.get('version');
  const allowFee = settingsStorage.get('allowFeePopup');
  const filters = storage.get('filters');
  const { option, verifiedOnly, zeroBalance } = filters && JSON.parse(filters);

  return {
    apiKeys: {},
    alerts: (alerts || []) as Array<Alert>,
    allowTopUpAlert: allowTopUpAlerts ? Boolean(JSON.parse(allowTopUpAlerts)) : false,
    indexerType: indexerType ? (indexerType as IndexerType) : IndexerType.SUBQUERY,
    subqueryEndpoint: null,
    subsquidEndpoint: null,
    subqueryStatus: ConnectionStatus.Unavailable,
    subsquidStatus: ConnectionStatus.Unavailable,
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
    feeMultiplier: feeMultiplier ? Number(JSON.parse(feeMultiplier)) : 0,
    runtimeVersion: runtimeVersion ? Number(JSON.parse(runtimeVersion)) : 0,
    feeMultiplierAndRuntimeSubscriptions: null,
    networkFees: {} as NetworkFeesObject, // It won't be empty at the moment of usage
    shouldBalanceBeHidden: shouldBalanceBeHidden ? Boolean(JSON.parse(shouldBalanceBeHidden)) : false,
  };
}

const state = initialState();

export default state;
