import { Component, Mixins } from 'vue-property-decorator';
import { History, TransactionStatus, Operation } from '@sora-substrate/util';
import findLast from 'lodash/fp/findLast';
import { Action, Getter } from 'vuex-class';

import { api } from '../../api';
import { delay, formatAddress, groupRewardsByAssetsList } from '../../util';
import TranslationMixin from './TranslationMixin';
import LoadingMixin from './LoadingMixin';
import NumberFormatterMixin from './NumberFormatterMixin';

import type { Account } from '../../types/common';

@Component
export default class TransactionMixin extends Mixins(TranslationMixin, LoadingMixin, NumberFormatterMixin) {
  private time = 0;

  transaction: Nullable<History> = null; // It's used just for sync errors

  @Getter account!: Account;

  @Action addActiveTransaction!: (tx: History) => Promise<void>;
  @Action removeActiveTransaction!: (tx: History) => Promise<void>;

  getMessage(value?: History): string {
    if (!value || !Object.values(Operation).includes(value.type as Operation)) {
      return '';
    }
    const params = { ...value } as any;
    if ([Operation.Transfer, Operation.SwapAndSend].includes(value.type)) {
      const isRecipient = this.account.address === value.to;
      const address = isRecipient ? value.from : value.to;
      const direction = isRecipient ? this.t('transaction.from') : this.t('transaction.to');
      const action = isRecipient ? this.t('recievedText') : this.t('sentText');

      params.address = formatAddress(address as string, 10);
      params.direction = direction;
      params.action = action;
    }
    if (
      [
        Operation.AddLiquidity,
        Operation.CreatePair,
        Operation.Transfer,
        Operation.RemoveLiquidity,
        Operation.Swap,
        Operation.SwapAndSend,
      ].includes(value.type)
    ) {
      params.amount = params.amount ? this.formatStringValue(params.amount) : '';
    }
    if (
      [
        Operation.AddLiquidity,
        Operation.CreatePair,
        Operation.RemoveLiquidity,
        Operation.Swap,
        Operation.SwapAndSend,
      ].includes(value.type)
    ) {
      params.amount2 = params.amount2 ? this.formatStringValue(params.amount2) : '';
    }
    if (value.type === Operation.ClaimRewards) {
      params.rewards = groupRewardsByAssetsList(params.rewards)
        .map(({ amount, asset }) => `${amount} ${asset.symbol}`)
        .join(` ${this.t('operations.andText')} `);
    }
    let status = value.status as TransactionStatus;
    if ([TransactionStatus.Invalid, TransactionStatus.Usurped].includes(status)) {
      status = TransactionStatus.Error;
    } else if (status !== TransactionStatus.Error) {
      status = TransactionStatus.Finalized;
    }
    return this.t(`operations.${status}.${value.type}`, params);
  }

  private async getLastTransaction(): Promise<void> {
    // Now we are checking every transaction with 1 second interval
    const tx = findLast((item) => Number(item.startTime) > this.time, api.history);
    if (!tx) {
      await delay();
      return await this.getLastTransaction();
    }
    this.transaction = tx;
    this.addActiveTransaction(this.transaction);
  }

  /** Should be used with @Watch like a singletone in a root of the project */
  handleChangeTransaction(value: History): void {
    if (
      !value ||
      !value.status ||
      ![TransactionStatus.Finalized, TransactionStatus.Error].includes(value.status as TransactionStatus)
    ) {
      return;
    }
    const message = this.getMessage(value);
    if (value.status === TransactionStatus.Error) {
      this.$notify({
        message: message || this.t('unknownErrorText'),
        type: 'error',
        title: '',
      });
    } else if (value.status === TransactionStatus.Finalized) {
      this.$notify({
        message,
        type: 'success',
        title: '',
      });
    }
    this.time = 0;
    this.removeActiveTransaction(value);
  }

  async withNotifications(func: AsyncVoidFn): Promise<void> {
    await this.withLoading(async () => {
      try {
        this.time = Date.now();
        await func();
        await this.getLastTransaction();
        this.$notify({ message: this.t('transactionSubmittedText'), title: '' });
      } catch (error) {
        const message = this.getMessage(this.transaction as History);
        this.time = 0;
        if (this.transaction) {
          this.removeActiveTransaction(this.transaction);
          this.transaction = null;
        }
        this.$notify({
          message: message || this.t('unknownErrorText'),
          type: 'error',
          title: '',
        });
        throw new Error((error as any).message);
      }
    });
  }
}
