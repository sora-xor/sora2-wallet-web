import { settingsStorage } from '../../util/storage';

import type { TransactionsState } from './types';

function initialState(): TransactionsState {
  const isConfirmTxDialogEnabled = settingsStorage.get('confirmTxDialogEnabled');
  const isSignTxDialogEnabled = settingsStorage.get('signTxDialogEnabled');

  return {
    history: {}, // history items what not synced with subquery
    externalHistory: {},
    externalHistoryTotal: 0,
    externalHistorySubscription: null,
    externalHistoryUpdates: {}, // history items coming from subscription
    saveExternalHistoryUpdates: false, // should we save them in state
    activeTxsIds: [],
    updateActiveTxsId: null,
    selectedTxId: null,
    updateEthBridgeHistory: null,
    isConfirmTxDialogEnabled: isConfirmTxDialogEnabled ? Boolean(JSON.parse(isConfirmTxDialogEnabled)) : true,
    isSignTxDialogEnabled: isSignTxDialogEnabled ? Boolean(JSON.parse(isSignTxDialogEnabled)) : true,
    isSignTxDialogVisible: false,
  };
}

const state = initialState();

export default state;
