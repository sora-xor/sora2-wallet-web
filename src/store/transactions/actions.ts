import { Operation } from '@sora-substrate/util';
import { defineActions } from 'direct-vuex';

import { api } from '../../api';
import { SubqueryExplorerService, SubqueryDataParserService } from '../../services/subquery';
import { historyElementsFilter } from '../../services/subquery/queries/historyElements';
import store, { rootActionContext } from '../../store';

import { transactionsActionContext } from './../transactions';

import type { ExternalHistoryParams } from '../../types/history';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2_000;

/** Only for Desktop management */
async function waitUntilConfirmTxDialogOpened(): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = store.original.watch(
      (state) => state.wallet.transactions.isConfirmTxDialogVisible,
      (value) => {
        if (!value) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}

const actions = defineActions({
  async beforeTransactionSign(context): Promise<void> {
    const { commit, state } = transactionsActionContext(context);
    const { rootState } = rootActionContext(context);

    if (rootState.wallet.account.isExternal) return;

    commit.setConfirmTxDialogVisibility(true);

    await waitUntilConfirmTxDialogOpened();

    if (!state.isTxApprovedViaConfirmTxDialog) {
      throw new Error('Cancelled');
    }
  },

  async subscribeOnExternalHistory(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    const { rootState, rootGetters, rootCommit } = rootActionContext(context);
    const { isLoggedIn, account } = rootGetters.wallet.account;

    commit.resetExternalHistorySubscription();

    if (!isLoggedIn) return;

    try {
      const subscription = SubqueryExplorerService.account.createHistorySubscription(
        account.address,
        async (transaction) => {
          const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

          if (!historyItem) return;
          // Don't handle bridge operations
          if ([Operation.EthBridgeIncoming, Operation.EthBridgeOutgoing].includes(historyItem.type)) return;

          // Save history item to local history
          // This will update unsynced transactions and restore pending transactions too
          api.saveHistory(historyItem);
          // Update storage - this will show new element on history view
          commit.getHistory();

          // Handle incoming Transfer or SwapAndSend
          if (
            [Operation.Transfer, Operation.SwapAndSend].includes(historyItem.type) &&
            historyItem.to === account.address
          ) {
            const asset = rootGetters.wallet.account.whitelist[historyItem.assetAddress as string];

            if (asset && rootState.wallet.settings.allowTopUpAlert) {
              rootCommit.wallet.account.setAssetToNotify(asset as WhitelistArrayItem);
            }
          }
        }
      );
      commit.setExternalHistorySubscription(subscription);
    } catch (error) {
      console.error(error);
    }
  },

  /**
   * Get history items from explorer, already filtered
   */
  async getExternalHistory(
    context,
    {
      next = true,
      address = '',
      assetAddress = '',
      pageAmount = 8,
      page = 1,
      query: { search = '', operationNames = [], assetsAddresses = [] } = {},
    }: ExternalHistoryParams = {}
  ): Promise<void> {
    const { state, commit } = transactionsActionContext(context);
    const { externalHistoryPagination: pagination, externalHistory } = state;

    if (pagination && ((next && !pagination.hasNextPage) || (!next && !pagination.hasPreviousPage))) return;

    const operations = SubqueryDataParserService.supportedOperations;
    const filter = historyElementsFilter({
      address,
      assetAddress,
      operations,
      query: { search, operationNames, assetsAddresses },
    });

    const variables = {
      filter,
      first: pageAmount,
      offset: pageAmount * (page - 1),
    };

    try {
      const response = await SubqueryExplorerService.account.getHistory(variables);

      if (!response) return;

      const { nodes, pageInfo, totalCount } = response;
      const buffer = {};
      const removeHistoryIds: Array<string> = [];

      if (nodes.length) {
        for (const transaction of nodes) {
          const { id } = transaction;

          if (!(id in externalHistory)) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

            if (historyItem) {
              buffer[id] = historyItem;

              if (id in api.history) {
                removeHistoryIds.push(id);
              }
            }
          }
        }

        if (removeHistoryIds.length) {
          commit.removeHistoryByIds(removeHistoryIds);
        }
      }

      commit.setExternalHistory({ ...externalHistory, ...buffer });
      commit.setExternalHistoryTotal(totalCount);
      commit.setExternalHistoryPagination(pageInfo);
    } catch (error) {
      console.error(error);
    }
  },
  /**
   * Should be used once in a root of the project
   */
  async trackActiveTxs(context): Promise<void> {
    const { commit, state } = transactionsActionContext(context);
    commit.resetActiveTxs();

    const updateActiveTxsId = setInterval(() => {
      if (state.activeTxsIds.length) {
        commit.getHistory();
      }
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL);

    commit.setActiveTxsSubscription(updateActiveTxsId);
  },
  /** It's used **only** for subscriptions module */
  async getAccountHistory(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    commit.getHistory();
  },
  /** It's used **only** for subscriptions module */
  async resetActiveTxs(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    commit.resetActiveTxs();
  },
  /** It's used **only** for subscriptions module */
  async resetExternalHistorySubscription(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    commit.resetExternalHistorySubscription();
  },
});

export default actions;
