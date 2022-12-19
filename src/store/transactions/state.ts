import type { TransactionsState } from './types';

function initialState(): TransactionsState {
  return {
    history: {}, // history items what not synced with subquery
    externalHistory: {},
    externalHistoryTotal: 0,
    externalHistoryPagination: null,
    externalHistorySubscription: null,
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
