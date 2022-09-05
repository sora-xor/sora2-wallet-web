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
      <transaction-hash-view :value="getTransactionHash(isSoraTx)" :type="HashType.ID" translation="transaction.txId" />
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
          is-formatted
          value-can-be-hidden
          :label="t('transaction.fee')"
          :value="getNetworkFee(isSoraTx)"
          :asset-symbol="getNetworkFeeSymbol(isSoraTx)"
        />
      </div>
      <transaction-hash-view
        v-if="transactionFromAddress"
        :translation="`transaction.${isSetReferralOperation ? 'referral' : 'from'}`"
        :value="transactionFromAddress"
        :type="isSoraTx ? HashType.Account : HashType.EthAccount"
      />
      <transaction-hash-view
        v-if="transactionToAddress && !isEthBridgeOperation && (!isSetReferralOperation || !isReferrer)"
        :translation="`transaction.${isSetReferralOperation ? 'referrer' : 'to'}`"
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
      <transaction-hash-view
        :value="getTransactionHash(!isSoraTx)"
        :translation="t('transaction.txId')"
        :type="HashType.ID"
      />
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
          :value="getNetworkFee(!isSoraTx)"
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
import WalletBase from './WalletBase.vue';
import InfoLine from './InfoLine.vue';
import FormattedAmount from './FormattedAmount.vue';
import TransactionHashView from './TransactionHashView.vue';

import { HashType, ETH_BRIDGE_STATES } from '../consts';
import { getter } from '../store/decorators';

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
export default class WalletTransactionDetails extends Mixins(TranslationMixin, NumberFormatterMixin) {
  readonly HashType = HashType;

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
    if (this.isEthBridgeOperation) return this.isTransactionFromCompleted;
    // or default transaction
    return [TransactionStatus.InBlock, TransactionStatus.Finalized].includes(
      this.selectedTransaction.status as TransactionStatus
    );
  }

  get isFailedTransaction(): boolean {
    // ETH BRIDGE transaction (first part)
    if (this.isEthBridgeOperation) return this.isTransactionFromFailed;
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

  // ETH BRIDGE transaction
  get isEthBridgeOperation(): boolean {
    return [Operation.EthBridgeOutgoing, Operation.EthBridgeIncoming].includes(this.selectedTransaction.type);
  }

  get isSetReferralOperation(): boolean {
    return this.selectedTransaction.type === Operation.ReferralSetInvitedUser;
  }

  get isReferrer(): boolean {
    return this.isSetReferralOperation && this.account.address === this.selectedTransaction.to;
  }

  get isInvitedUser(): boolean {
    return this.isSetReferralOperation && this.account.address === this.selectedTransaction.from;
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
      errMessage = this.t(`historyErrorMessages.${error.section}.${error.name}`);
      if (errMessage.startsWith('historyErrorMessages')) {
        return this.t(`historyErrorMessages.generalError`);
      }
    }

    return errMessage;
  }

  // ETH BRIDGE transaction
  get currentState(): string {
    return (this.selectedTransaction as BridgeHistory)?.transactionState ?? ETH_BRIDGE_STATES.INITIAL;
  }

  // ETH BRIDGE transaction
  get isTransferStarted(): boolean {
    return this.currentState !== ETH_BRIDGE_STATES.INITIAL;
  }

  // ETH BRIDGE transaction
  get isTransactionFromPending(): boolean {
    return this.currentState === (this.isSoraTx ? ETH_BRIDGE_STATES.SORA_PENDING : ETH_BRIDGE_STATES.EVM_PENDING);
  }

  // ETH BRIDGE transaction
  get isTransactionFromFailed(): boolean {
    return this.currentState === (this.isSoraTx ? ETH_BRIDGE_STATES.SORA_REJECTED : ETH_BRIDGE_STATES.EVM_REJECTED);
  }

  // ETH BRIDGE transaction
  get isTransactionToFailed(): boolean {
    return this.currentState === (!this.isSoraTx ? ETH_BRIDGE_STATES.SORA_REJECTED : ETH_BRIDGE_STATES.EVM_REJECTED);
  }

  // ETH BRIDGE transaction
  get isTransactionFromCompleted(): boolean {
    return this.isTransferStarted && !this.isTransactionFromPending && !this.isTransactionFromFailed;
  }

  // ETH BRIDGE transaction
  get isTransactionToCompleted(): boolean {
    return this.currentState === (!this.isSoraTx ? ETH_BRIDGE_STATES.SORA_COMMITED : ETH_BRIDGE_STATES.EVM_COMMITED);
  }

  public getNetworkTitle(isSoraTx = true): string {
    return this.t(isSoraTx ? 'soraText' : 'ethereumText');
  }

  public getNetworkFee(isSoraTx = true): string {
    if (isSoraTx) {
      return this.formatCodecNumber(this.selectedTransaction.soraNetworkFee as string);
    } else {
      return this.formatCodecNumber((this.selectedTransaction as BridgeHistory).ethereumNetworkFee as string);
    }
  }

  public getNetworkFeeSymbol(isSoraTx = true): string {
    return isSoraTx ? KnownSymbols.XOR : KnownSymbols.ETH;
  }

  public getTransactionHash(isSoraTx = true): Nullable<string> {
    return isSoraTx ? this.selectedTransaction.txId : (this.selectedTransaction as BridgeHistory).ethereumHash;
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
