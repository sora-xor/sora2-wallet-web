<template>
  <div class="history s-flex">
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
          v-button
          :key="index"
          tabindex="0"
          @click="handleOpenTransactionDetails(item.id)"
        >
          <div class="history-item-info">
            <div class="history-item-operation ch3" :data-type="item.type">{{ getTitle(item) }}</div>
            <div class="history-item-title p4">{{ getOperationMessage(item, shouldBalanceBeHidden) }}</div>
            <s-icon v-if="!isFinalizedStatus(item)" :class="getStatusClass(item)" :name="getStatusIcon(item)" />
          </div>
          <div class="history-item-date">{{ formatDate(item.startTime, DateFormat) }}</div>
        </div>
      </template>
      <div v-else class="history-empty p4">{{ t(`history.${hasTransactions ? 'emptySearch' : 'empty'}`) }}</div>
    </div>
    <history-pagination
      v-if="hasVisibleTransactions && total > pageAmount"
      :current-page="currentPage"
      :page-amount="pageAmount"
      :total="total"
      :loading="loading"
      :last-page="lastPage"
      @pagination-click="handlePaginationClick"
    />
  </div>
</template>

<script lang="ts">
import { TransactionStatus } from '@sora-substrate/util';
import debounce from 'lodash/fp/debounce';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { RouteNames, PaginationButton } from '../consts';
import { getCurrentIndexer } from '../services/indexer';
import { state, mutation, action } from '../store/decorators';
import { getStatusIcon, getStatusClass } from '../util';

import HistoryPagination from './HistoryPagination.vue';
import SearchInput from './Input/SearchInput.vue';
import EthBridgeTransactionMixin from './mixins/EthBridgeTransactionMixin';
import LoadingMixin from './mixins/LoadingMixin';
import PaginationSearchMixin from './mixins/PaginationSearchMixin';
import TransactionMixin from './mixins/TransactionMixin';

import type { EthBridgeUpdateHistory } from '../consts';
import type { Route } from '../store/router/types';
import type { ExternalHistoryParams } from '../types/history';
import type { History, AccountHistory, HistoryItem, Operation } from '@sora-substrate/util';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    SearchInput,
    HistoryPagination,
  },
})
export default class WalletHistory extends Mixins(
  LoadingMixin,
  TransactionMixin,
  PaginationSearchMixin,
  EthBridgeTransactionMixin
) {
  /** Date format without seconds, full date time will be available in TX Details */
  readonly DateFormat = 'll LT';

  @state.account.assets private assets!: Array<Asset>;
  @state.transactions.history private history!: AccountHistory<HistoryItem>;
  @state.transactions.externalHistory private externalHistory!: AccountHistory<HistoryItem>;
  @state.transactions.externalHistoryTotal private externalHistoryTotal!: number;
  @state.transactions.updateEthBridgeHistory private updateEthBridgeHistory!: Nullable<EthBridgeUpdateHistory>;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.transactions.resetExternalHistory private resetExternalHistory!: FnWithoutArgs;
  @mutation.transactions.getHistory private getHistory!: FnWithoutArgs;
  @mutation.transactions.setTxDetailsId private setTxDetailsId!: (id: string) => void;
  @action.transactions.getExternalHistory private getExternalHistory!: (args?: ExternalHistoryParams) => Promise<void>;

  @Prop() readonly asset!: Nullable<AccountAsset>;

  @Watch('searchQuery')
  private async updateHistoryBySearchQuery() {
    await this.updateCommonHistory();
  }

  readonly pageAmount = 8; // override PaginationSearchMixin
  readonly updateCommonHistory = debounce(500)(() => this.updateHistory(true, 1, true));

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

  get hasVisibleTransactions(): boolean {
    return !!this.transactions.length;
  }

  get hasTransactions(): boolean {
    return this.hasVisibleTransactions || !!this.searchQuery;
  }

  get queryOperationNames(): Array<Operation> {
    if (!this.searchQuery) return [];

    const indexer = getCurrentIndexer();
    return indexer.services.dataParser.supportedOperations.filter((operation) =>
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
    if (this.updateEthBridgeHistory) {
      this.updateEthBridgeHistory(this.getHistory);
    }
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

  private getStatus(item: HistoryItem): string {
    let status = 'success';

    if (this.isErrorStatus(item)) {
      status = TransactionStatus.Error;
    } else if (!this.isFinalizedStatus(item)) {
      status = 'in_progress';
    }

    return status.toUpperCase();
  }

  getStatusClass(item: HistoryItem): string {
    return getStatusClass(this.getStatus(item));
  }

  getStatusIcon(item: HistoryItem): string {
    return getStatusIcon(this.getStatus(item));
  }

  isFinalizedStatus(item: HistoryItem): boolean {
    if (this.isEthBridgeTx(item)) return this.isEthBridgeTxToCompleted(item);

    return [TransactionStatus.InBlock, TransactionStatus.Finalized].includes(item.status as TransactionStatus);
  }

  private isErrorStatus(item: HistoryItem): boolean {
    if (this.isEthBridgeTx(item)) return this.isEthBridgeTxFromFailed(item) || this.isEthBridgeTxToFailed(item);

    return [TransactionStatus.Error, TransactionStatus.Invalid].includes(item.status as TransactionStatus);
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
        if (current === this.lastPage) {
          this.isLtrDirection = false;
        }
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
    @include focus-outline($borderRadius: var(--s-border-radius-small));
    &:not(:first-child):not(:focus) {
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
    &:focus + .history-item:before,
    &:focus + .el-loading-mask + .history-item:before {
      background-color: transparent;
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
</style>
