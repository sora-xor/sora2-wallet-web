import { defineMutations } from 'direct-vuex';
import { NFTStorage } from 'nft.storage';

import { api } from '../../api';
import { MAX_ALERTS_NUMBER, SoraNetwork, WalletAssetFilters, WalletPermissions, IndexerType } from '../../consts';
import { runtimeStorage, settingsStorage, storage } from '../../util/storage';

import type { SettingsState } from './types';
import type { Alert, ApiKeysObject, ConnectionStatus } from '../../types/common';
import type { NetworkFeesObject } from '@sora-substrate/util';
import type { Subscription } from 'rxjs';

const mutations = defineMutations<SettingsState>()({
  setIndexerType(state, indexerType: IndexerType): void {
    state.indexerType = indexerType;
    storage.set('indexerType', indexerType);
  },
  setWalletLoaded(state, flag: boolean): void {
    state.isWalletLoaded = flag;
  },
  setPermissions(state, permissions: WalletPermissions): void {
    if (typeof permissions !== 'object' || Array.isArray(permissions)) {
      console.error(`Permissions should be an object, ${typeof permissions} is given`);
      return;
    }
    state.permissions = { ...state.permissions, ...permissions };
  },
  setSoraNetwork(state, value: Nullable<SoraNetwork>): void {
    state.soraNetwork = value;
  },
  setNetworkFees(state, fees: NetworkFeesObject = {} as NetworkFeesObject): void {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    api.NetworkFee = networkFees;
  },
  updateNetworkFees(state, fees = {} as NetworkFeesObject): void {
    const networkFees = { ...fees };
    state.networkFees = networkFees;
    runtimeStorage.set('networkFees', JSON.stringify(networkFees));
  },
  toggleHideBalance(state): void {
    state.shouldBalanceBeHidden = !state.shouldBalanceBeHidden;
    storage.set('shouldBalanceBeHidden', state.shouldBalanceBeHidden);
  },
  setFilterOptions(state, filters: WalletAssetFilters): void {
    storage.set('filters', JSON.stringify(filters));
    state.filters = filters;
  },
  setAllowFeePopup(state, flag: boolean) {
    settingsStorage.set('allowFeePopup', flag.toString());
    state.allowFeePopup = flag;
  },
  setFeeMultiplier(state, multiplier: number): void {
    state.feeMultiplier = multiplier;
    runtimeStorage.set('feeMultiplier', multiplier);
  },
  setRuntimeVersion(state, version: number): void {
    state.runtimeVersion = version;
    runtimeStorage.set('version', version);
  },
  setFeeMultiplierAndRuntimeSubscriptions(state, subscription: Subscription): void {
    if (state.feeMultiplierAndRuntimeSubscriptions) {
      state.feeMultiplierAndRuntimeSubscriptions.unsubscribe();
    }
    state.feeMultiplierAndRuntimeSubscriptions = subscription;
  },
  resetFeeMultiplierAndRuntimeSubscriptions(state): void {
    if (state.feeMultiplierAndRuntimeSubscriptions) {
      state.feeMultiplierAndRuntimeSubscriptions.unsubscribe();
      state.feeMultiplierAndRuntimeSubscriptions = null;
    }
  },
  setApiKeys(state, keys: ApiKeysObject = {}): void {
    state.apiKeys = { ...state.apiKeys, ...keys };
  },
  setNftStorage(state, { marketplaceDid, ucan }: { marketplaceDid?: string; ucan?: string }): void {
    let nftStorage: NFTStorage;

    if (marketplaceDid && ucan) {
      // on prod environment
      nftStorage = new NFTStorage({
        token: ucan,
        did: marketplaceDid,
      });
    } else {
      // on dev, test environments
      nftStorage = new NFTStorage({ token: state.apiKeys.nftStorage });
    }

    state.nftStorage = nftStorage;
  },
  setSubqueryEndpoint(state, endpoint: string): void {
    state.subqueryEndpoint = endpoint;
  },
  setSubsquidEndpoint(state, endpoint: string): void {
    state.subsquidEndpoint = endpoint;
  },
  setSubqueryStatus(state, status: ConnectionStatus): void {
    state.subqueryStatus = status;
  },
  setSubsquidStatus(state, status: ConnectionStatus): void {
    state.subsquidStatus = status;
  },
  setDepositNotifications(state, allow: boolean): void {
    state.allowTopUpAlert = allow;
    settingsStorage.set('allowTopUpAlerts', allow);
  },
  addPriceAlert(state, alert: Alert): void {
    const alerts = [alert, ...state.alerts].slice(0, MAX_ALERTS_NUMBER);
    state.alerts = alerts;
    settingsStorage.set('alerts', JSON.stringify(alerts));
  },
  removePriceAlert(state, position: number): void {
    state.alerts.splice(position, 1);
    settingsStorage.set('alerts', JSON.stringify(state.alerts));
  },

  editPriceAlert(state, { alert, position }): void {
    state.alerts[position] = alert;
    settingsStorage.set('alerts', JSON.stringify(state.alerts));
  },
  setPriceAlertAsNotified(state, { position, value }): void {
    const alert = state.alerts[position];
    alert.wasNotified = value;
    state.alerts[position] = alert;
    settingsStorage.set('alerts', JSON.stringify(state.alerts));
  },
});

export default mutations;
