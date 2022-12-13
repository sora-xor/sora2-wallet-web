import findLast from 'lodash/fp/findLast';
import { Component, Mixins } from 'vue-property-decorator';
import { History, TransactionStatus, Operation } from '@sora-substrate/util';
import type { HistoryItem } from '@sora-substrate/util';

import { api } from '../../api';
import { delay, formatAddress, groupRewardsByAssetsList } from '../../util';
import TranslationMixin from './TranslationMixin';
import LoadingMixin from './LoadingMixin';
import NumberFormatterMixin from './NumberFormatterMixin';
import { HiddenValue } from '../../consts';
import store from '../../store';
import { getter, mutation, action, state } from '../../store/decorators';
import type { PolkadotJsAccount, AccountAssetsTable } from '../../types/common';

const twoAssetsBasedOperations = [
  Operation.AddLiquidity,
  Operation.CreatePair,
  Operation.RemoveLiquidity,
  Operation.Swap,
  Operation.SwapAndSend,
  Operation.DemeterFarmingDepositLiquidity,
  Operation.DemeterFarmingWithdrawLiquidity,
];
const accountIdBasedOperations = [Operation.SwapAndSend, Operation.Transfer];

@Component
export default class TransactionMixin extends Mixins(TranslationMixin, LoadingMixin, NumberFormatterMixin) {
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

  @getter.account.account account!: PolkadotJsAccount;
  @getter.account.accountAssetsAddressTable accountAssetsAddressTable!: AccountAssetsTable;

  @mutation.transactions.addActiveTx addActiveTransaction!: (id: string) => void;
  @mutation.transactions.removeActiveTxs removeActiveTxs!: (ids: string[]) => void;

  @action.account.addAsset private addAsset!: (address?: string) => Promise<void>;

  getMessage(value?: History, hideAmountValues = false): string {
    if (!value || !Object.values(Operation).includes(value.type as Operation)) {
      return '';
    }
    const params = { ...value } as any;
    if (accountIdBasedOperations.includes(value.type)) {
      const isRecipient = this.account.address === value.to;
      const address = isRecipient ? value.from : value.to;
      const direction = isRecipient ? this.t('transaction.from') : this.t('transaction.to');
      const action = isRecipient ? this.t('receivedText') : this.t('sentText');

      params.address = formatAddress(address as string, 10);
      params.direction = direction;
      params.action = action;
    }
    if (
      [
        ...twoAssetsBasedOperations,
        Operation.Transfer,
        Operation.DemeterFarmingGetRewards,
        Operation.DemeterFarmingStakeToken,
        Operation.DemeterFarmingUnstakeToken,
        Operation.EthBridgeIncoming,
        Operation.EthBridgeOutgoing,
      ].includes(value.type)
    ) {
      params.amount = params.amount ? this.formatStringValue(params.amount, params.decimals) : '';
    }
    if (twoAssetsBasedOperations.includes(value.type)) {
      params.amount2 = params.amount2 ? this.formatStringValue(params.amount2, params.decimals2) : '';
    }
    if (value.type === Operation.ClaimRewards) {
      params.rewards = groupRewardsByAssetsList(params.rewards)
        .map(({ amount, asset }) => {
          if (hideAmountValues) return HiddenValue;
          return `${this.formatStringValue(amount)} ${asset.symbol}`;
        })
        .join(` ${this.t('operations.andText')} `);
    }
    let status = value.status as TransactionStatus;
    if ([TransactionStatus.Invalid, TransactionStatus.Usurped].includes(status)) {
      status = TransactionStatus.Error;
    } else if (status !== TransactionStatus.Error) {
      status = TransactionStatus.Finalized;
    }
    if (hideAmountValues) {
      params.amount = HiddenValue;
      params.amount2 = HiddenValue;
      params.symbol = value.type === Operation.RegisterAsset ? HiddenValue : '';
      params.symbol2 = '';
    }
    return this.t(`operations.${status}.${value.type}`, params);
  }

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

    const message = this.getMessage(value);
    // is transaction has not been processed before
    const isNewTx = !oldValue || oldValue.id !== value.id;

    if (value.status === TransactionStatus.Error) {
      this.$notify({
        message: message || this.t('unknownErrorText'),
        type: 'error',
        title: '',
      });
    } else if (value.status === TransactionStatus.InBlock || isNewTx) {
      if (isNewTx) {
        this.$notify({
          message,
          type: 'success',
          title: '',
        });
      }
      if (value.status === TransactionStatus.InBlock) return;
    } else if (value.type === Operation.RegisterAsset && value.assetAddress) {
      // If user was really fast and already added tx
      const alreadyExists = this.accountAssetsAddressTable[value.assetAddress];
      if (!alreadyExists) {
        // Add asset automatically for registered assets for finalized txs made by the account
        this.addAsset(value.assetAddress).then(() => {
          this.$notify({
            message: this.t('addAsset.success', { symbol: value.symbol || '' }),
            type: 'success',
            title: '',
          });
        });
      }
    }
    // remove active tx on finalized or error status
    this.removeActiveTxs([value.id as string]);
  }

  async withNotifications(func: AsyncVoidFn): Promise<void> {
    if (this.isDesktop) {
      this.setConfirmTxDialogVisibility(true);
      await this.waitUntilConfirmTxDialogOpened();
      if (!this.isTxApprovedViaConfirmTxDialog) {
        this.$notify({
          message: this.t('unknownErrorText'), // TODO: [Desktop] Add cancel text
          type: 'error',
          title: '',
        });
        return;
      }
    }
    await this.withLoading(async () => {
      try {
        const time = Date.now();
        await func();
        const tx = await this.getLastTransaction(time);
        this.addActiveTransaction(tx.id as string);
        this.$notify({ message: this.t('transactionSubmittedText'), title: '' });
      } catch (error) {
        this.$notify({
          message: this.t('unknownErrorText'),
          type: 'error',
          title: '',
        });
        throw new Error((error as any).message);
      } finally {
        if (this.isDesktop) {
          api.lockPair();
        }
      }
    });
  }
}
