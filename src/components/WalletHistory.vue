<template>
  <div class="history s-flex">
    <s-form class="history-form" :show-message="false">
      <search-input
        v-if="hasTransactions"
        :placeholder="t('history.filterPlaceholder')"
        v-model="query"
        autofocus
        @clear="resetSearch"
        class="history--search"
      />
      <div class="history-items" v-loading="loading">
        <template v-if="hasVisibleTransactions">
          <div
            class="history-item s-flex"
            v-for="(item, index) in transactions"
            :key="index"
            @click="handleOpenTransactionDetails(item.id)"
          >
            <div class="history-item-info">
              <div class="history-item-operation ch3" :data-type="item.type">{{ t(`operations.${item.type}`) }}</div>
              <div class="history-item-title p4">{{ getMessage(item, shouldBalanceBeHidden) }}</div>
              <s-icon
                v-if="!isFinalizedStatus(item.status)"
                :class="getStatusClass(item.status)"
                :name="getStatusIcon(item.status)"
              />
            </div>
            <div class="history-item-date">{{ formatDate(item.startTime) }}</div>
          </div>
        </template>
        <div v-else class="history-empty p4">{{ t(`history.${hasTransactions ? 'emptySearch' : 'empty'}`) }}</div>
      </div>
      <s-pagination
        v-if="hasVisibleTransactions && total > pageAmount"
        layout="slot"
        :current-page.sync="currentPage"
        :page-size="pageAmount"
        :total-text="totalText"
      >
        <span class="el-pagination__total">{{ totalText }}</span>
        <s-button
          type="link"
          :tooltip="t('history.firstText')"
          :disabled="isFirstPage"
          @click="handlePaginationClick(PaginationButton.First)"
        >
          <s-icon name="chevrons-left-16" size="14" />
        </s-button>
        <s-button
          type="link"
          :tooltip="t('history.prevText')"
          :disabled="isFirstPage"
          @click="handlePaginationClick(PaginationButton.Prev)"
        >
          <s-icon name="chevron-left-16" size="14" />
        </s-button>
        <s-button
          type="link"
          :tooltip="t('history.nextText')"
          :disabled="isLastPage"
          @click="handlePaginationClick(PaginationButton.Next)"
        >
          <s-icon name="chevron-right-16" size="14" />
        </s-button>
        <s-button
          type="link"
          :tooltip="t('history.lastText')"
          :disabled="isLastPage"
          @click="handlePaginationClick(PaginationButton.Last)"
        >
          <s-icon name="chevrons-right-16" size="14" />
        </s-button>
      </s-pagination>
    </s-form>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { History, TransactionStatus } from '@sora-substrate/util';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import type { AccountHistory, HistoryItem, Operation } from '@sora-substrate/util';

import LoadingMixin from './mixins/LoadingMixin';
import TransactionMixin from './mixins/TransactionMixin';
import PaginationSearchMixin from './mixins/PaginationSearchMixin';
import SearchInput from './SearchInput.vue';
import { getStatusIcon, getStatusClass } from '../util';
import { RouteNames, PaginationButton } from '../consts';
import { state, mutation, action } from '../store/decorators';
import { SubqueryDataParserService } from '../services/subquery';
import type { ExternalHistoryParams } from '../types/history';
import type { Route } from '../store/router/types';

@Component({
  components: {
    SearchInput,
  },
})
export default class WalletHistory extends Mixins(LoadingMixin, TransactionMixin, PaginationSearchMixin) {
  @state.account.assets private assets!: Array<Asset>;
  @state.transactions.history private history!: AccountHistory<HistoryItem>;
  @state.transactions.externalHistory private externalHistory!: AccountHistory<HistoryItem>;
  @state.transactions.externalHistoryTotal private externalHistoryTotal!: number;
  @state.settings.shouldBalanceBeHidden shouldBalanceBeHidden!: boolean;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.transactions.resetExternalHistory private resetExternalHistory!: VoidFn;
  @mutation.transactions.getHistory private getHistory!: VoidFn;
  @mutation.transactions.setTxDetailsId private setTxDetailsId!: (id: string) => void;
  @action.transactions.getExternalHistory private getExternalHistory!: (args?: ExternalHistoryParams) => Promise<void>;

  @Prop() readonly asset!: Nullable<AccountAsset>;

  @Watch('searchQuery')
  private async updateHistoryBySearchQuery() {
    await this.updateCommonHistory();
  }

  readonly pageAmount = 8; // override PaginationSearchMixin
  isLtrDirection = true; // Change pagination number from left to right
  readonly updateCommonHistory = debounce(() => this.updateHistory(true, 1, true), 500);
  readonly PaginationButton = PaginationButton;

  get assetAddress(): string {
    return (this.asset && this.asset.address) || '';
  }

  get internalHistory(): Array<History> {
    const historyList = Object.values(this.history);
    const prefiltered = this.assetAddress
      ? historyList.filter((item) => {
          return [item.assetAddress, item.asset2Address].includes(this.assetAddress);
        })
      : historyList;

    return prefiltered;
  }

  get filteredInternalHistory(): Array<History> {
    return this.getFilteredHistory(this.internalHistory);
  }

  get filteredExternalHistory(): Array<History> {
    return Object.values(this.externalHistory);
  }

  get transactions(): Array<History> {
    const merged = [...this.filteredInternalHistory, ...this.filteredExternalHistory];
    const sorted = this.sortTransactions(merged, this.isLtrDirection);

    const end = this.isLtrDirection
      ? Math.min(this.currentPage * this.pageAmount, sorted.length)
      : Math.max((this.lastPage - this.currentPage + 1) * this.pageAmount - this.directionShift, 0);

    const start = this.isLtrDirection
      ? Math.max(end - this.pageAmount, 0)
      : Math.max((this.lastPage - this.currentPage) * this.pageAmount - this.directionShift, 0);

    return this.sortTransactions(this.getPageItems(sorted, start, end), true);
  }

  get total(): number {
    return this.externalHistoryTotal + this.internalHistory.length;
  }

  get isFirstPage(): boolean {
    return this.currentPage === 1 || this.loading;
  }

  get lastPage(): number {
    return this.total ? Math.ceil(this.total / this.pageAmount) : 1;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.lastPage || this.loading;
  }

  get lastPageAmount(): number {
    return this.total % this.pageAmount || this.pageAmount;
  }

  get directionShift(): number {
    return this.isLtrDirection ? 0 : this.pageAmount - this.lastPageAmount;
  }

  get totalText(): string {
    const upperNumber = this.pageAmount * this.currentPage;

    return `${this.t('ofText', {
      first: `${upperNumber - this.pageAmount + 1}-${upperNumber > this.total ? this.total : upperNumber}`,
      second: this.total,
    })}`;
  }

  get hasVisibleTransactions(): boolean {
    return !!this.transactions.length;
  }

  get hasTransactions(): boolean {
    return this.hasVisibleTransactions || !!this.searchQuery;
  }

  get queryOperationNames(): Array<Operation> {
    if (!this.searchQuery) return [];

    return SubqueryDataParserService.supportedOperations.filter((operation) =>
      this.t(`operations.${operation}`).toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get queryAssetsAddresses(): Array<string> {
    if (!this.searchQuery) return [];

    return this.assets.reduce((buffer: Array<string>, asset) => {
      if (asset.symbol.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        buffer.push(asset.address);
      }
      return buffer;
    }, []);
  }

  async mounted() {
    this.updateHistory(true, 1, true);
  }

  reset(): void {
    this.resetPage();
    this.resetExternalHistory();
  }

  getFilteredHistory(history: Array<History>): Array<History> {
    if (!this.searchQuery) {
      return history;
    }

    const query = this.searchQuery.toLowerCase();

    return history.filter(
      (item) =>
        // asset address criteria
        `${item.assetAddress}`.toLowerCase() === query ||
        `${item.asset2Address}`.toLowerCase() === query ||
        // symbol criteria
        `${item.symbol}`.toLowerCase().includes(query) ||
        `${item.symbol2}`.toLowerCase().includes(query) ||
        // search qriteria
        `${item.blockId}`.toLowerCase().includes(query) ||
        // account address criteria
        `${item.from}`.toLowerCase() === query ||
        `${item.to}`.toLowerCase() === query ||
        // operation names criteria
        this.t(`operations.${item.type}`).toLowerCase().includes(query)
    );
  }

  sortTransactions(transactions: Array<History>, isAscendingOrder = false): Array<History> {
    return transactions.sort((a: History, b: History) =>
      a.startTime && b.startTime ? (isAscendingOrder ? b.startTime - a.startTime : a.startTime - b.startTime) : 0
    );
  }

  getStatus(status: string): string {
    if ([TransactionStatus.Error, TransactionStatus.Invalid].includes(status as TransactionStatus)) {
      status = TransactionStatus.Error;
    } else if (!this.isFinalizedStatus(status)) {
      status = 'in_progress';
    }
    return status.toUpperCase();
  }

  getStatusClass(status?: string): string {
    return getStatusClass(this.getStatus(status || ''));
  }

  getStatusIcon(status?: string): string {
    return getStatusIcon(this.getStatus(status || ''));
  }

  isFinalizedStatus(status?: TransactionStatus | string): boolean {
    return [TransactionStatus.InBlock, TransactionStatus.Finalized].includes(status as TransactionStatus);
  }

  handleOpenTransactionDetails(id?: string): void {
    if (!id) {
      this.navigate({ name: RouteNames.Wallet });
    } else {
      this.setTxDetailsId(id);
    }
  }

  async handlePaginationClick(button: PaginationButton): Promise<void> {
    let current = 1;

    switch (button) {
      case PaginationButton.Prev:
        current = this.currentPage - 1;
        break;
      case PaginationButton.Next:
        current = this.currentPage + 1;
        break;
      case PaginationButton.First:
        this.isLtrDirection = true;
        break;
      case PaginationButton.Last:
        current = this.lastPage;
        this.isLtrDirection = false;
    }

    const isNext = current > this.currentPage;
    await this.updateHistory(isNext, current);
    this.currentPage = current;
  }

  /**
   * Update external & internal history
   * @param next - if true, fetch next page, else previous
   * @param withReset - reset current page number & clear external history
   */
  private async updateHistory(next = true, page = 1, withReset = false): Promise<void> {
    await this.withLoading(async () => {
      if (withReset) {
        this.reset();
      }
      this.getHistory(); // TODO: refactoring action
      await this.getExternalHistory({
        next,
        page,
        address: this.account.address,
        assetAddress: this.assetAddress,
        pageAmount: this.pageAmount,
        query: {
          search: this.searchQuery,
          operationNames: this.queryOperationNames,
          assetsAddresses: this.queryAssetsAddresses,
        },
      });
      this.getHistory();
    });
  }
}
</script>

<style lang="scss">
.history {
  .el-card__body {
    padding: #{$basic-spacing-medium} #{$basic-spacing-medium} calc(var(--s-basic-spacing) * 2.5);
  }
  .el-pagination {
    justify-content: end;
    align-items: baseline;
    &__total {
      margin-right: auto;
      letter-spacing: var(--s-letter-spacing-small);
      color: var(--s-color-base-content-secondary);
    }
    .el-button.neumorphic {
      margin-left: 0;
      height: var(--s-small-medium);
      padding: 0;
      &:not(:hover):not(:active) {
        color: var(--s-color-base-content-tertiary);
      }
      span {
        min-width: calc(var(--s-basic-spacing) * 2.5);
      }
    }
  }
  &--search {
    .el-input__inner {
      padding-right: var(--s-size-medium);
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

$history-item-horizontal-space: 10px;
$history-item-height: 48px;
$history-item-top-border-height: 1px;

.history {
  flex-direction: column;
  margin-top: calc(var(--s-basic-spacing) * 2);

  &--search {
    margin-bottom: #{$basic-spacing-medium};
  }

  &-items {
    min-height: $history-item-height;
  }

  &-item {
    display: flex;
    flex-direction: column;
    margin-right: -#{$history-item-horizontal-space * 2};
    margin-left: -#{$history-item-horizontal-space * 2};
    min-height: $history-item-height;
    padding: calc(var(--s-basic-spacing) + #{$history-item-top-border-height}) $history-item-horizontal-space * 2;
    font-size: var(--s-font-size-mini);
    border-radius: var(--s-border-radius-small);
    &:not(:first-child) {
      position: relative;
      &:before {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        display: block;
        margin-right: auto;
        margin-left: auto;
        height: 1px;
        width: calc(100% - #{$history-item-horizontal-space * 4});
        content: '';
        background-color: var(--s-color-base-border-secondary);
      }
    }
    &:hover {
      background-color: var(--s-color-base-background-hover);
      cursor: pointer;
    }
    &-info {
      display: flex;
      align-items: flex-start;
      .info-status {
        &--loading,
        &--success,
        &--error {
          line-height: var(--s-font-size-small);
        }
        &.info-status--loading {
          height: var(--s-font-size-small);
        }
        &--error {
          color: var(--s-color-status-error);
        }
      }
      // TODO: [1.5] remove it
      i.info-status--loading {
        width: var(--s-icon-font-size-mini);
        height: var(--s-icon-font-size-mini);
        margin-right: 6px;
        &:before {
          content: '';
        }
      }
    }
    &-title {
      width: auto;
      padding-right: var(--s-basic-spacing);
      line-height: var(--s-line-height-mini);
    }
    &-title,
    &-date {
      width: 100%;
    }
    &-date {
      margin-top: $basic-spacing-mini;
      line-height: var(--s-line-height-mini);
      color: var(--s-color-base-content-tetriary);
    }
    &-operation {
      flex-shrink: 0;
      color: var(--s-color-theme-accent);
      border-radius: var(--s-border-radius-mini);
      margin-right: $basic-spacing-mini;
    }
    &-title,
    &-date {
      width: 100%;
    }
    &-date {
      color: var(--s-color-base-content-secondary);
      line-height: var(--s-line-height-mini);
    }
    &-icon {
      flex-shrink: 0;
      align-self: flex-start;
      margin-top: $basic-spacing-mini;
      margin-right: var(--s-basic-spacing);
      margin-left: auto;
    }
    .info-status--loading {
      @include svg-icon;
      @include loading;
      background-image: $status-pending-svg;
      height: var(--s-font-size-mini);
      width: var(--s-font-size-mini);
    }
  }
  &-empty {
    text-align: center;
  }
}
.el-pagination {
  display: flex;
  margin-top: #{$basic-spacing-medium};
  padding-left: 0;
  padding-right: 0;
}
</style>
