import { settingsStorage } from '../../util/storage';

import type { TransactionsState } from './types';

function initialState(): TransactionsState {
  const isConfirmTxDialogEnabled = settingsStorage.get('confirmTxDialogEnabled');
  const isSignTxDialogDisabled = settingsStorage.get('signTxDialogDisabled');

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
    isSignTxDialogDisabled: isSignTxDialogDisabled ? Boolean(JSON.parse(isSignTxDialogDisabled)) : false,
    isSignTxDialogVisible: false,
  };
}

const state = initialState();

export default state;
