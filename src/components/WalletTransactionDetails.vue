<template>
  <wallet-base
    :title="t(!selectedTransaction ? 'transaction.title' : `operations.${selectedTransaction.type}`)"
    show-back
    @back="handleBack"
  >
    <div class="transaction" v-if="selectedTransaction">
      <transaction-hash-view
        v-if="transactionId"
        :value="transactionId"
        :translation="transactionIdKey"
        :type="selectedTransaction.txId ? HashType.ID : HashType.Block"
      />
      <div class="info-line-container">
        <info-line v-if="selectedTransaction.status" :label="t('transaction.status')">
          <span :class="statusClass">{{ statusTitle }}</span>
          <s-icon v-if="isComplete" name="basic-check-mark-24" size="16px" />
        </info-line>
        <info-line v-if="selectedTransaction.errorMessage" :label="t('transaction.errorMessage')">
          <span :class="statusClass">{{ selectedTransaction.errorMessage }}</span>
        </info-line>
        <info-line v-if="selectedTransaction.startTime" :label="t('transaction.startTime')" :value="transactionDate" />
        <info-line
          v-if="selectedTransaction.amount"
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount')"
          :value="transactionAmount"
          :asset-symbol="selectedTransaction.symbol"
        />
        <info-line
          v-if="selectedTransaction.amount2"
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount2')"
          :value="transactionAmount2"
          :asset-symbol="selectedTransaction.symbol2"
        />
      </div>
      <transaction-hash-view
        v-if="selectedTransaction.from"
        translation="transaction.from"
        :value="selectedTransaction.from"
        :type="HashType.Account"
      />
      <transaction-hash-view
        v-if="selectedTransaction.to"
        translation="transaction.to"
        :value="selectedTransaction.to"
        :type="HashType.Account"
      />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import { TransactionStatus, History } from '@sora-substrate/util';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import TranslationMixin from './mixins/TranslationMixin';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import WalletBase from './WalletBase.vue';
import InfoLine from './InfoLine.vue';
import FormattedAmount from './FormattedAmount.vue';
import TransactionHashView from './TransactionHashView.vue';
import { RouteNames, WalletTabs, HashType } from '../consts';

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

  @Getter currentRouteParams!: any;
  @Getter selectedTransaction!: History;
  @Getter accountAssets!: Array<AccountAsset>;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getTransactionDetails!: (id: string) => Promise<void>;

  mounted() {
    const id: string = this.currentRouteParams.id;
    if (!id) {
      this.navigate({ name: RouteNames.Wallet });
    }
    this.getTransactionDetails(id);
  }

  get asset(): AccountAsset {
    // currentRouteParams.asset was added here to avoid a case when the asset is not found
    return (
      this.accountAssets.find(({ address }) => address === this.currentRouteParams.asset.address) ||
      (this.currentRouteParams.asset as AccountAsset)
    );
  }

  get statusClass(): Array<string> {
    const baseClass = 'transaction-status';
    const classes = [baseClass];

    if (this.selectedTransaction.status === 'error') {
      classes.push(`${baseClass}--error`);
    }

    return classes;
  }

  get isComplete(): boolean {
    return [TransactionStatus.Finalized, 'done'].includes(this.selectedTransaction.status as TransactionStatus);
  }

  get statusTitle(): string {
    if ([TransactionStatus.Error, 'invalid'].includes(this.selectedTransaction.status as string)) {
      return this.t('transaction.statuses.failed');
    } else if (this.isComplete) {
      return this.t('transaction.statuses.complete');
    }
    return this.t('transaction.statuses.pending');
  }

  get transactionIdKey(): string {
    return `transaction.${this.selectedTransaction.txId ? 'txId' : 'blockId'}`;
  }

  get transactionId(): Nullable<string> {
    return this.selectedTransaction.txId || this.selectedTransaction.blockId;
  }

  get transactionAmount(): string {
    return this.formatStringValue(this.selectedTransaction.amount as string);
  }

  get transactionAmount2(): string {
    return this.formatStringValue(this.selectedTransaction.amount2 as string);
  }

  get transactionDate(): string {
    return this.formatDate(this.selectedTransaction.startTime as number);
  }

  handleBack(): void {
    if (this.currentRouteParams.asset) {
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.asset } });
      return;
    }
    this.navigate({ name: RouteNames.Wallet, params: { currentTab: WalletTabs.Activity } });
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
