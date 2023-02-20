import findLast from 'lodash/fp/findLast';
import { Component, Mixins } from 'vue-property-decorator';
import { TransactionStatus, Operation } from '@sora-substrate/util';
import type { HistoryItem } from '@sora-substrate/util';

import { api } from '../../api';
import { delay } from '../../util';
import OperationsMixin from './OperationsMixin';
import LoadingMixin from './LoadingMixin';
import store from '../../store';
import { getter, mutation, action, state } from '../../store/decorators';
import type { AccountAssetsTable } from '../../types/common';

@Component
export default class TransactionMixin extends Mixins(LoadingMixin, OperationsMixin) {
  // Desktop management
  @state.account.isDesktop isDesktop!: boolean;
  @state.transactions.isTxApprovedViaConfirmTxDialog private isTxApprovedViaConfirmTxDialog!: boolean;
  @mutation.transactions.setConfirmTxDialogVisibility private setConfirmTxDialogVisibility!: (flag: boolean) => void;

  /** Only for Desktop management */
  private async waitUntilConfirmTxDialogOpened(): Promise<void> {
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

  @state.settings.shouldBalanceBeHidden shouldBalanceBeHidden!: boolean;

  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @mutation.transactions.addActiveTx addActiveTransaction!: (id: string) => void;
  @mutation.transactions.removeActiveTxs removeActiveTxs!: (ids: string[]) => void;

  @action.account.addAsset private addAsset!: (address?: string) => Promise<void>;

  private async getLastTransaction(time: number): Promise<HistoryItem> {
    const tx = findLast((item) => Number(item.startTime) > time, api.historyList);
    if (!tx) {
      await delay();
      return await this.getLastTransaction(time);
    }
    return tx;
  }

  /** Should be used with @Watch like a singletone in a root of the project */
  handleChangeTransaction(value: Nullable<HistoryItem>, oldValue: Nullable<HistoryItem>): void {
    if (
      !value ||
      !value.status ||
      ![TransactionStatus.InBlock, TransactionStatus.Finalized, TransactionStatus.Error].includes(
        value.status as TransactionStatus
      )
    ) {
      return;
    }

    const message = this.getOperationMessage(value, this.shouldBalanceBeHidden);
    // is transaction has not been processed before
    const isNewTx = !oldValue || oldValue.id !== value.id;

    if (value.status === TransactionStatus.Error) {
      this.showAppNotification(message, 'error');
    } else if (value.status === TransactionStatus.InBlock || isNewTx) {
      if (isNewTx) {
        this.showAppNotification(message, 'success');
      }
      if (value.status === TransactionStatus.InBlock) return;
    } else if (value.type === Operation.RegisterAsset && value.assetAddress) {
      // If user was really fast and already added tx
      const alreadyExists = this.accountAssetsAddressTable[value.assetAddress];
      if (!alreadyExists) {
        // Add asset automatically for registered assets for finalized txs made by the account
        this.addAsset(value.assetAddress).then(() => {
          this.showAppNotification(this.t('addAsset.success', { symbol: value.symbol || '' }), 'success');
        });
      }
    }
    // remove active tx on finalized or error status
    this.removeActiveTxs([value.id as string]);
  }

  async withNotifications(func: AsyncFnWithoutArgs): Promise<void> {
    if (this.isDesktop) {
      this.setConfirmTxDialogVisibility(true);
      await this.waitUntilConfirmTxDialogOpened();
      if (!this.isTxApprovedViaConfirmTxDialog) {
        // TODO: [Desktop] Add cancel text
        this.showAppNotification(this.t(this.defaultErrorMessage), 'error');
        return;
      }
    }

    await this.withLoading(async () => {
      await this.withAppNotification(async () => {
        try {
          const time = Date.now();
          await func();
          const tx = await this.getLastTransaction(time);
          this.addActiveTransaction(tx.id as string);
          this.showAppNotification(this.t('transactionSubmittedText'));
        } finally {
          if (this.isDesktop) {
            api.lockPair();
          }
        }
      });
    });
  }
}
