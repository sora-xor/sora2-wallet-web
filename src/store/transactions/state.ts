import type { TransactionsState } from './types';

function initialState(): TransactionsState {
  return {
    history: {}, // history items what not synced with subquery
    externalHistory: {},
    externalHistoryTotal: 0,
    externalHistoryPagination: null,
    activeTxsIds: [],
    updateActiveTxsId: null,
    selectedTxId: null,
  };
}

const state = initialState();

export default state;
