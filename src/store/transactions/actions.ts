import { defineActions } from 'direct-vuex';
import type { HistoryItem } from '@sora-substrate/util';

import { transactionsActionContext } from './../transactions';
import { api } from '../../api';
import { delay } from '../../util';
import { BLOCK_PRODUCE_TIME } from '../../consts';
import { SubqueryExplorerService, SubqueryDataParserService } from '../../services/subquery';
import { historyElementsFilter } from '../../services/subquery/queries/historyElements';
import type { ExternalHistoryParams } from '../../types/history';

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2 * 1000;

const actions = defineActions({
  async restorePendingTxs(context): Promise<void> {
    const { state, dispatch, getters } = transactionsActionContext(context);
    // if tracking is disabled, return
    if (state.updateActiveTxsId === null) return;

    const now = Date.now();
    // difference in time between last block & finilized block (ideal)
    const delta = 3 * BLOCK_PRODUCE_TIME;
    // find transactions, which blocks should be produced
    const txs: HistoryItem[] = [...getters.activeTxs].filter(
      (item: HistoryItem) => now - (item.startTime as number) > delta
    );

    if (txs.length) {
      try {
        const ids = txs.map((tx) => tx.id as string);
        const variables = { filter: { id: { in: ids } } };
        const response = await SubqueryExplorerService.getAccountTransactions(variables);

        if (response && response.edges.length) {
          for (const edge of response.edges) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(edge.node);

            if (historyItem && (historyItem.id as string) in api.history) {
              api.saveHistory(historyItem);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    await delay(BLOCK_PRODUCE_TIME);
    dispatch.restorePendingTxs(); // TODO: check it
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
    const { externalHistoryPagination: pagination, externalHistory, history } = state;

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
      const response = await SubqueryExplorerService.getAccountTransactions(variables);

      if (!response) return;

      const { edges, pageInfo, totalCount } = response;
      const buffer = {};
      const removeHistoryIds: Array<string> = [];

      if (edges.length) {
        for (const edge of edges) {
          const transaction = edge.node;
          const { id } = transaction;

          if (!(id in externalHistory)) {
            const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

            if (historyItem) {
              buffer[id] = historyItem;

              if (id in history) {
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
    const { commit, state, dispatch } = transactionsActionContext(context);
    commit.resetActiveTxs();

    const updateActiveTxsId = setInterval(async () => {
      if (state.activeTxsIds.length) {
        commit.getHistory();
      }
    }, UPDATE_ACTIVE_TRANSACTIONS_INTERVAL);
    commit.setActiveTxsSubscription(updateActiveTxsId);

    dispatch.restorePendingTxs();
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
});

export default actions;
