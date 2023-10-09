import type { EthBridgeUpdateHistory } from '../../consts';
import type { PageInfo } from '../../services/indexer/subsquid/types';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

export type TransactionsState = {
  history: AccountHistory<HistoryItem>;
  externalHistory: AccountHistory<HistoryItem>;
  externalHistoryTotal: number;
  externalHistoryPagination: Nullable<PageInfo>;
  externalHistorySubscription: Nullable<VoidFunction>;
  activeTxsIds: Array<string>;
  updateActiveTxsId: Nullable<NodeJS.Timeout | number>;
  selectedTxId: Nullable<string>;
  updateEthBridgeHistory: Nullable<EthBridgeUpdateHistory>;
  /**
   * Confirm Ttransaction Dialog visibility
   *
   * Uses **only** without polkadot js based extensions for signing transactions.
   *
   * `true` when it's opened, `false` when it's closed
   */
  isConfirmTxDialogVisible: boolean;
  /**
   * Confirm Ttransaction Dialog approved TX state
   *
   * Uses **only** without polkadot js based extensions for signing transactions.
   *
   * `true` when TX is approved, `false` when it's cancelled
   */
  isTxApprovedViaConfirmTxDialog: boolean;
};
