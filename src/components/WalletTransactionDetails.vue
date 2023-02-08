<template>
  <div class="transaction-container">
    <div class="transaction">
      <div v-if="isEthBridgeOperation" class="transaction-network">
        {{
          `${t('bridgeTransaction.steps.step', { step: '1' })} ${t('bridgeTransaction.networkTitle', {
            network: getNetworkTitle(isSoraTx),
          })}`
        }}
      </div>
      <transaction-hash-view v-if="transactionFromHash.value" v-bind="transactionFromHash" />
      <div class="info-line-container">
        <info-line :label="t('transaction.status')">
          <span :class="statusClass">{{ statusTitle }}</span>
          <s-icon v-if="isCompleteTransaction" name="basic-check-mark-24" size="16px" />
        </info-line>
        <info-line v-if="errorMessage" :label="t('transaction.errorMessage')">
          <span :class="statusClass">{{ errorMessage }}</span>
        </info-line>
        <info-line v-if="transactionFromDate" :label="t('transaction.startTime')" :value="transactionFromDate" />
        <info-line
          v-if="selectedTransaction.amount"
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount')"
          :value="transactionAmount"
          :asset-symbol="transactionSymbol"
        />
        <info-line
          v-if="selectedTransaction.amount2"
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount2')"
          :value="transactionAmount2"
          :asset-symbol="transactionSymbol2"
        />
        <info-line
          v-if="transactionFromFee"
          is-formatted
          :label="t('transaction.fee')"
          :value="transactionFromFee"
          :asset-symbol="getNetworkFeeSymbol(isSoraTx)"
        />
      </div>
      <transaction-hash-view
        v-if="transactionFromAddress"
        :translation="isSetReferralOperation ? 'transaction.referral' : 'transaction.from'"
        :value="transactionFromAddress"
        :type="isSoraTx ? HashType.Account : HashType.EthAccount"
      />
      <transaction-hash-view
        v-if="transactionToAddress && !isEthBridgeOperation && (!isSetReferralOperation || !isReferrer)"
        :translation="isSetReferralOperation ? 'transaction.referrer' : 'transaction.to'"
        :value="transactionToAddress"
        :type="HashType.Account"
      />
    </div>

    <div v-if="isEthBridgeOperation" class="transaction">
      <div class="transaction-network">
        {{
          `${t('bridgeTransaction.steps.step', { step: '2' })} ${t('bridgeTransaction.networkTitle', {
            network: getNetworkTitle(!isSoraTx),
          })}`
        }}
      </div>
      <transaction-hash-view v-if="transactionToHash.value" v-bind="transactionToHash" />
      <div class="info-line-container">
        <info-line :label="t('transaction.status')">
          <span :class="statusClass2">{{ statusTitle2 }}</span>
          <s-icon v-if="isTransactionToCompleted" name="basic-check-mark-24" size="16px" />
        </info-line>
        <info-line v-if="transactionToDate" :label="t('transaction.startTime')" :value="transactionToDate" />
        <info-line
          v-if="selectedTransaction.amount"
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount')"
          :value="transactionAmount"
          :asset-symbol="transactionSymbol"
        />
        <info-line
          is-formatted
          value-can-be-hidden
          :label="t('transaction.fee')"
          :value="transactionToFee"
          :asset-symbol="getNetworkFeeSymbol(!isSoraTx)"
        />
      </div>
      <transaction-hash-view
        v-if="transactionToAddress"
        translation="transaction.to"
        :value="transactionToAddress"
        :type="!isSoraTx ? HashType.Account : HashType.EthAccount"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { TransactionStatus, Operation, HistoryItem } from '@sora-substrate/util';
import { KnownSymbols } from '@sora-substrate/util/build/assets/consts';

import TranslationMixin from './mixins/TranslationMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import EthBridgeTransactionMixin from './mixins/EthBridgeTransactionMixin';
import WalletBase from './WalletBase.vue';
import InfoLine from './InfoLine.vue';
import FormattedAmount from './FormattedAmount.vue';
import TransactionHashView from './TransactionHashView.vue';

import { HashType, SoraNetwork } from '../consts';
import { getter, state } from '../store/decorators';

import type { BridgeHistory } from '@sora-substrate/util';
import type { PolkadotJsAccount } from '../types/common';

@Component({
  components: {
    WalletBase,
    InfoLine,
    FormattedAmount,
    TransactionHashView,
  },
})
export default class WalletTransactionDetails extends Mixins(
  TranslationMixin,
  NumberFormatterMixin,
  EthBridgeTransactionMixin
) {
  readonly HashType = HashType;

  @state.settings.soraNetwork private soraNetwork!: SoraNetwork;

  @getter.account.account private account!: PolkadotJsAccount;
  @getter.transactions.selectedTx selectedTransaction!: HistoryItem; // It shouldn't be empty

  get isSoraTx(): boolean {
    return !this.isEthBridgeOperation || this.selectedTransaction.type === Operation.EthBridgeOutgoing;
  }

  get statusClass(): Array<string> {
    return this.getStatusClass(this.isFailedTransaction);
  }

  // ETH BRIDGE transaction
  get statusClass2(): Array<string> {
    return this.getStatusClass(this.isTransactionToFailed);
  }

  get isCompleteTransaction(): boolean {
    // ETH BRIDGE transaction (first part)
    if (this.isEthBridgeOperation) return this.isEthBridgeTxFromCompleted(this.selectedTransaction);
    // or default transaction
    return [TransactionStatus.InBlock, TransactionStatus.Finalized].includes(
      this.selectedTransaction.status as TransactionStatus
    );
  }

  get isFailedTransaction(): boolean {
    // ETH BRIDGE transaction (first part)
    if (this.isEthBridgeOperation) return this.isEthBridgeTxFromFailed(this.selectedTransaction);
    // or default transaction
    return [TransactionStatus.Error, TransactionStatus.Invalid].includes(
      this.selectedTransaction.status as TransactionStatus
    );
  }

  // Transaction status (or ETH BRIDGE transaction first part status)
  get statusTitle(): string {
    if (this.isFailedTransaction) {
      return this.t('transaction.statuses.failed');
    }
    if (this.isCompleteTransaction) {
      return this.t('transaction.statuses.complete');
    }
    return this.t('transaction.statuses.pending');
  }

  // ETH BRIDGE transaction second part status
  get statusTitle2(): string {
    if (this.isTransactionToFailed) {
      return this.t('transaction.statuses.failed');
    }
    if (this.isTransactionToCompleted) {
      return this.t('transaction.statuses.complete');
    }
    return this.t('transaction.statuses.pending');
  }

  get transactionAmount(): string {
    return this.formatStringValue(this.selectedTransaction.amount as string);
  }

  get transactionAmount2(): string {
    return this.formatStringValue(this.selectedTransaction.amount2 as string);
  }

  get transactionSymbol(): string {
    const { type, symbol, symbol2 } = this.selectedTransaction;

    if ([Operation.DemeterFarmingDepositLiquidity, Operation.DemeterFarmingWithdrawLiquidity].includes(type)) {
      return `${symbol}-${symbol2}`;
    }

    return symbol || '';
  }

  get transactionSymbol2(): string {
    return this.selectedTransaction.symbol2 || '';
  }

  get transactionFromFee(): Nullable<string> {
    return this.getNetworkFee(this.isSoraTx);
  }

  // ETH BRIDGE transaction
  get transactionToFee(): Nullable<string> {
    return this.getNetworkFee(!this.isSoraTx);
  }

  get transactionFromDate(): Nullable<string> {
    if (!this.selectedTransaction.startTime) return null;

    return this.formatDate(this.selectedTransaction.startTime as number);
  }

  // ETH BRIDGE transaction
  get transactionToDate(): Nullable<string> {
    if (!this.selectedTransaction.endTime) return null;

    return this.formatDate(this.selectedTransaction.endTime as number);
  }

  get transactionFromAddress(): Nullable<string> {
    return this.getTransactionAddress(this.isSoraTx, true);
  }

  get transactionToAddress(): Nullable<string> {
    return this.getTransactionAddress(this.isSoraTx, false);
  }

  get transactionFromHash() {
    return this.getTransactionHashData(this.isSoraTx);
  }

  get transactionToHash() {
    return this.getTransactionHashData(!this.isSoraTx);
  }

  get isSetReferralOperation(): boolean {
    return this.selectedTransaction.type === Operation.ReferralSetInvitedUser;
  }

  get isReferrer(): boolean {
    return this.isSetReferralOperation && this.account.address === this.selectedTransaction.to;
  }

  get errorMessage(): Nullable<string> {
    const error = this.selectedTransaction.errorMessage;
    if (!error) {
      return null;
    }

    let errMessage = this.t(`historyErrorMessages.generalError`);

    if (typeof error === 'string') {
      return errMessage; // Backward compatibility
    }

    if (error.name && error.section) {
      errMessage = this.t(`historyErrorMessages.${error.section.toLowerCase()}.${error.name.toLowerCase()}`);
      if (errMessage.startsWith('historyErrorMessages')) {
        // was not found in json files
        return this.t(`historyErrorMessages.generalError`);
      }
    }

    return errMessage;
  }

  // ETH BRIDGE transaction
  get isEthBridgeOperation(): boolean {
    return this.isEthBridgeTx(this.selectedTransaction);
  }

  // ETH BRIDGE transaction
  get isTransactionToFailed(): boolean {
    return this.isEthBridgeTxToFailed(this.selectedTransaction);
  }

  // ETH BRIDGE transaction
  get isTransactionToCompleted(): boolean {
    return this.isEthBridgeTxToCompleted(this.selectedTransaction);
  }

  public getNetworkTitle(isSoraTx = true): string {
    if (isSoraTx) {
      return this.t(`sora.${this.soraNetwork}`);
    }

    return this.TranslationConsts.Ethereum;
  }

  public getNetworkFeeSymbol(isSoraTx = true): string {
    return isSoraTx ? KnownSymbols.XOR : KnownSymbols.ETH;
  }

  private getNetworkFee(isSoraTx = true): Nullable<string> {
    const fee = isSoraTx
      ? this.selectedTransaction.soraNetworkFee
      : (this.selectedTransaction as BridgeHistory).ethereumNetworkFee;

    if (!fee) return null;

    return this.formatCodecNumber(fee);
  }

  private getTransactionHashData(isSoraTx = true): {
    value: Nullable<string>;
    hash: Nullable<string>;
    translation: string;
    type: HashType;
    block: Nullable<string>;
  } {
    const { value, type } = this.getTransactionId(isSoraTx);
    const hash = this.getTransactionHash(isSoraTx);
    const translation = this.getTransactionTranslation(isSoraTx, type === HashType.Block);
    const block = isSoraTx && type === HashType.ID ? this.selectedTransaction.blockId : undefined;

    return { value, hash, translation, type, block };
  }

  private getTransactionHash(isSoraTx = true): Nullable<string> {
    if (!isSoraTx) return (this.selectedTransaction as BridgeHistory).ethereumHash;

    return this.isEthBridgeOperation ? (this.selectedTransaction as BridgeHistory).hash : this.selectedTransaction.txId;
  }

  private getTransactionId(isSoraTx = true): { type: HashType; value: Nullable<string> } {
    if (!isSoraTx) {
      return {
        type: HashType.EthTransaction,
        value: (this.selectedTransaction as BridgeHistory).ethereumHash,
      };
    }

    if (this.selectedTransaction.txId) {
      return {
        type: HashType.ID,
        value: this.selectedTransaction.txId,
      };
    }

    return {
      type: HashType.Block,
      value: this.selectedTransaction.blockId,
    };
  }

  private getTransactionTranslation(isSoraTx = true, isBlock = false): string {
    if (!isSoraTx || this.isEthBridgeOperation) return 'bridgeTransaction.transactionHash';

    return isBlock ? 'transaction.blockId' : 'transaction.txId';
  }

  private getTransactionAddress(isSoraTx = true, txFrom = true): Nullable<string> {
    const { from, to } = this.selectedTransaction;
    const [fromAddress, toAddress] = isSoraTx ? [from, to] : [to, from];

    return txFrom ? fromAddress : toAddress;
  }

  private getStatusClass(isFailedTransaction = false): Array<string> {
    const baseClass = 'transaction-status';
    const classes = [baseClass];

    if (isFailedTransaction) {
      classes.push(`${baseClass}--error`);
    }

    return classes;
  }
}
</script>

<style lang="scss">
.transaction {
  &-status {
    text-transform: capitalize;
    &--error {
      color: var(--s-color-status-error);
    }
  }
}
</style>

<style scoped lang="scss">
.transaction {
  .s-icon-basic-check-mark-24 {
    margin-left: var(--s-basic-spacing);
  }
  .info-line-container {
    margin-bottom: #{$basic-spacing-medium};
  }
  .formatted-amount__divider {
    margin-right: #{$basic-spacing-extra-mini};
    margin-left: #{$basic-spacing-extra-mini};
  }

  & + & {
    margin-top: #{$basic-spacing-big};
  }

  &-network {
    text-align: center;
    margin-bottom: var(--s-basic-spacing);
  }
}
.history {
  align-items: center;
  &-info {
    flex: 1;
    flex-direction: column;
    font-size: var(--s-font-size-mini);
    &_date {
      color: var(--s-color-base-content-tertiary);
    }
  }
  &:not(:last-child) {
    margin-bottom: var(--s-basic-spacing);
  }
}
</style>
