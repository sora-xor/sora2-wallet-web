<template>
  <div v-if="numberOfRecipients > 0" class="adar-tx-details">
    <div class="adar-tx-details__title">
      {{ t('transaction.title') }}
    </div>
    <div class="adar-tx-details__txs-container">
      <div v-for="(recipient, idx) in txsList" :key="idx">
        <transaction-hash-view
          :translation="'transaction.to'"
          :value="recipient.accountId"
          :type="HashType.Account"
          class="adar-tx-details__account-id"
        />
        <info-line
          is-formatted
          value-can-be-hidden
          :label="t('transaction.amount')"
          :value="formatStringValue(recipient.amount)"
          :asset-symbol="recipient.symbol"
        />
      </div>
    </div>
    <s-pagination
      class="adar-tx-details__pagination-panel"
      :layout="'prev, total, next'"
      :current-page.sync="currentPage"
      :page-size="pageAmount"
      :total="numberOfRecipients"
      @prev-click="handlePrevClick"
      @next-click="handleNextClick"
    />
  </div>
</template>

<script lang="ts">
import { Operation } from '@sora-substrate/sdk';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { formatAddress } from '@/util';

import { HashType } from '../consts';
import { getter } from '../store/decorators';

import InfoLine from './InfoLine.vue';
import NumberFormatterMixin from './mixins/NumberFormatterMixin';
import PaginationSearchMixin from './mixins/PaginationSearchMixin';
import TranslationMixin from './mixins/TranslationMixin';
import TransactionHashView from './TransactionHashView.vue';

import type { PolkadotJsAccount } from '../types/common';
import type { HistoryItem } from '@sora-substrate/sdk';

@Component({
  components: {
    InfoLine,
    TransactionHashView,
  },
})
export default class WalletAdarTxDetails extends Mixins(TranslationMixin, NumberFormatterMixin, PaginationSearchMixin) {
  readonly HashType = HashType;

  @getter.account.account private account!: PolkadotJsAccount;

  @Prop() readonly transaction!: HistoryItem;

  pageAmount = 4;

  get isAdarOperation(): boolean {
    return this.transaction.type === Operation.SwapTransferBatch;
  }

  get swapTransferBatchRecipients() {
    if (!this.isAdarOperation || this.account.address !== this.transaction.from) return [];
    return this.transaction.payload?.receivers;
  }

  get txsList() {
    return this.getPageItems(this.swapTransferBatchRecipients);
  }

  get numberOfRecipients() {
    return this.swapTransferBatchRecipients?.length || 0;
  }

  formatAddress(address: string) {
    return formatAddress(address);
  }
}
</script>

<style lang="scss">
.adar-tx-details {
  &__pagination-panel {
    display: flex;
    margin-top: $inner-spacing-medium;
    .el-pagination__total {
      margin: auto;
    }
  }
}
</style>

<style scoped lang="scss">
.adar-tx-details {
  &__txs-container {
    & > * {
      margin-bottom: #{$basic-spacing-big};
    }
  }

  &__account-id {
    margin-bottom: #{$basic-spacing-small};
  }

  &__title {
    font-size: var(--s-font-size-big);
    text-align: center;
    margin: #{$basic-spacing-medium} 0;
    text-transform: capitalize;
  }
}
</style>
