import type { TransactionsState } from './types';

function initialState(): TransactionsState {
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
    isConfirmTxDialogVisible: false,
    isTxApprovedViaConfirmTxDialog: false,
  };
}

const state = initialState();

export default state;
