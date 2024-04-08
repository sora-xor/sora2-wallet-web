import { Operation } from '@sora-substrate/util';
import { defineActions } from 'direct-vuex';
import omit from 'lodash/fp/omit';

import { api } from '../../api';
import { accountIdBasedOperations } from '../../consts';
import { getCurrentIndexer } from '../../services/indexer';
import store, { rootActionContext } from '../../store';

import { transactionsActionContext } from './../transactions';

import type { HistoryElement } from '../../services/indexer/types';
import type { ExternalHistoryParams } from '../../types/history';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type { ActionContext } from 'vuex';

const UPDATE_ACTIVE_TRANSACTIONS_INTERVAL = 2_000;

async function parseHistoryUpdate(context: ActionContext<any, any>, transaction: HistoryElement): Promise<void> {
  const { commit, state } = transactionsActionContext(context);
  const { rootState, rootGetters, rootCommit } = rootActionContext(context);
  const { account, whitelist } = rootGetters.wallet.account;

  const indexer = getCurrentIndexer();
  const historyItem = await indexer.services.dataParser.parseTransactionAsHistoryItem(transaction);

  if (!historyItem?.id) return;
  // Don't handle bridge operations
  if ([Operation.EthBridgeIncoming, Operation.EthBridgeOutgoing].includes(historyItem.type)) return;

  // remove history from local storage
  if (historyItem.id in api.history) {
    commit.removeHistoryByIds([historyItem.id]);
    // Update local history - this will remove deleted element from ui
    commit.getHistory();
  }

  // add to external history updates
  if (state.saveExternalHistoryUpdates && !(historyItem.id in state.externalHistory)) {
    commit.setExternalHistoryUpdates({ ...state.externalHistoryUpdates, [historyItem.id]: historyItem });
  }

  // Handle incoming Transfer operations
  if (accountIdBasedOperations.includes(historyItem.type) && historyItem.to === account.address) {
    const asset = whitelist[historyItem.assetAddress as string];

    if (asset && rootState.wallet.settings.allowTopUpAlert) {
      rootCommit.wallet.account.setAssetToNotify(asset as WhitelistArrayItem);
    }
  }
}

/** Only for Desktop management */
async function waitUntilConfirmTxDialogOpened(): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = store.original.watch(
      (state) => state.wallet.transactions.isSignTxDialogVisible,
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
    const { rootGetters, rootDispatch, rootState } = rootActionContext(context);

    if (rootState.wallet.account.isExternal) return;

    const { passphrase } = rootGetters.wallet.account;

    if (passphrase && !state.isSignTxDialogEnabled) {
      rootDispatch.wallet.account.unlockAccountPair(passphrase);
    } else {
      commit.setSignTxDialogVisibility(true);

      await waitUntilConfirmTxDialogOpened();
    }

    if (api.account?.pair.isLocked) {
      throw new Error('Cancelled');
    }
  },

  async subscribeOnExternalHistory(context): Promise<void> {
    const { commit } = transactionsActionContext(context);
    const { rootGetters } = rootActionContext(context);
    const { isLoggedIn, account } = rootGetters.wallet.account;

    commit.resetExternalHistorySubscription();

    if (!isLoggedIn) return;

    try {
      const indexer = getCurrentIndexer();
      const subscription = indexer.services.explorer.account.createHistorySubscription(
        account.address,
        async (transaction) => {
          await parseHistoryUpdate(context, transaction);
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
      address = '',
      assetAddress = '',
      pageAmount = 8,
      page = 1,
      query: { search = '', operationNames = [], assetsAddresses = [] } = {},
    }: ExternalHistoryParams = {}
  ): Promise<void> {
    const { state, commit } = transactionsActionContext(context);
    const { externalHistory, externalHistoryUpdates } = state;

    const indexer = getCurrentIndexer();
    const operations = indexer.services.dataParser.supportedOperations;
    const filter = indexer.historyElementsFilter({
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
      const response = await indexer.services.explorer.account.getHistory(variables);

      if (!response) return;

      const { nodes, totalCount } = response;
      const buffer = {};
      const removeInternalIds: Array<string> = [];
      const removeExternalUpdatesIds: Array<string> = [];

      if (nodes.length) {
        for (const transaction of nodes) {
          const { id } = transaction;

          if (!(id in externalHistory)) {
            const historyItem = await indexer.services.dataParser.parseTransactionAsHistoryItem(transaction as any); // TODO: remove any type

            if (historyItem) {
              buffer[id] = historyItem;

              if (id in api.history) {
                removeInternalIds.push(id);
              }

              if (id in externalHistoryUpdates) {
                removeExternalUpdatesIds.push(id);
              }
            }
          }
        }
      }

      if (removeInternalIds.length) {
        commit.removeHistoryByIds(removeInternalIds);
      }

      if (removeExternalUpdatesIds.length) {
        commit.setExternalHistoryUpdates(omit(removeExternalUpdatesIds, externalHistoryUpdates));
      }

      commit.setExternalHistory({ ...externalHistory, ...buffer });
      commit.setExternalHistoryTotal(totalCount);
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
