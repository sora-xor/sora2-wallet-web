import type { EthBridgeUpdateHistory } from '../../consts';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

export type TransactionsState = {
  history: AccountHistory<HistoryItem>;
  externalHistory: AccountHistory<HistoryItem>;
  externalHistoryUpdates: AccountHistory<HistoryItem>;
  saveExternalHistoryUpdates: boolean;
  externalHistoryTotal: number;
  externalHistorySubscription: Nullable<VoidFunction>;
  activeTxsIds: Array<string>;
  updateActiveTxsId: Nullable<NodeJS.Timeout | number>;
  selectedTxId: Nullable<string>;
  updateEthBridgeHistory: Nullable<EthBridgeUpdateHistory>;
  /**
   * Transaction confirmation used (before signing)
   *
   * `true` when it's enabled, `false` when it's disabled
   */
  isConfirmTxDialogEnabled: boolean;
  /**
   * Transaction signing confirmation used
   *
   * Uses **only** without polkadot js based extensions for signing transactions.
   *
   * `true` when it's enabled, `false` when it's disabled
   */
  isSignTxDialogDisabled: boolean;
  /**
   * Sign Transaction Dialog visibility
   *
   * Uses **only** without polkadot js based extensions for signing transactions.
   *
   * `true` when it's opened, `false` when it's closed
   */
  isSignTxDialogVisible: boolean;
};
