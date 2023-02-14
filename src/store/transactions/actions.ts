import { defineActions } from 'direct-vuex';
import { Operation } from '@sora-substrate/util';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

import { transactionsActionContext } from './../transactions';
import { rootActionContext } from '../../store';
import { api } from '../../api';
import { SubqueryExplorerService, SubqueryDataParserService } from '../../services/subquery';
import { historyElementsFilter } from '../../services/subquery/queries/historyElements';
import type { ExternalHistoryParams } from '../../types/history';

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2_000;

const actions = defineActions({
  async subscribeOnExternalHistory(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    const { rootGetters, rootCommit } = rootActionContext(context);
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

            if (asset) {
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
