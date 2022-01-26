<template>
  <div class="history s-flex">
    <s-form class="history-form" :show-message="false">
      <s-form-item v-if="hasTransactions" class="history--search">
        <s-input v-model="query" :placeholder="t('history.filterPlaceholder')" prefix="s-icon-search-16" size="big">
          <template #suffix v-if="query">
            <s-button class="s-button--clear" :use-design-system="false" @click="resetSearch">
              <s-icon name="clear-X-16" />
            </s-button>
          </template>
        </s-input>
      </s-form-item>
      <div class="history-items" v-loading="loading">
        <template v-if="transactions.length">
          <div
            class="history-item s-flex"
            v-for="item in transactions"
            :key="`history-${item.id}`"
            @click="handleOpenTransactionDetails(item.id)"
          >
            <div class="history-item-info">
              <div class="history-item-operation ch3" :data-type="item.type">{{ t(`operations.${item.type}`) }}</div>
              <div class="history-item-title p4">{{ getMessage(item, shouldBalanceBeHidden) }}</div>
              <s-icon
                v-if="item.status !== TransactionStatus.Finalized"
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
        v-if="transactions.length"
        layout="total, prev, next"
        :current-page.sync="currentPage"
        :page-size="pageAmount"
        :total="total"
        :disabled="loading"
        @prev-click="handlePaginationClick"
        @next-click="handlePaginationClick"
      />
    </s-form>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce';
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import { History, TransactionStatus } from '@sora-substrate/util';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';
import type { AccountHistory, HistoryItem, Operation } from '@sora-substrate/util';

import { api } from '../api';
import LoadingMixin from './mixins/LoadingMixin';
import TransactionMixin from './mixins/TransactionMixin';
import PaginationSearchMixin from './mixins/PaginationSearchMixin';
import { getStatusIcon, getStatusClass } from '../util';
import { RouteNames } from '../consts';
import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery';
import { historyElementsFilter } from '../services/subquery/queries/historyElements';

type PageInfo = {
  startCursor: string;
  endCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

@Component
export default class WalletHistory extends Mixins(LoadingMixin, TransactionMixin, PaginationSearchMixin) {
  @Getter assets!: Array<Asset>;
  @Getter activity!: AccountHistory<HistoryItem>;
  @Getter shouldBalanceBeHidden!: boolean;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getAccountActivity!: AsyncVoidFn;
  @Action getAssets!: AsyncVoidFn;

  @Prop() readonly asset?: AccountAsset;

  @Watch('searchQuery')
  private async updateHistoryBySearchQuery() {
    await this.updateCommonHistory();
  }

  TransactionStatus = TransactionStatus;

  pageAmount = 8; // override PaginationSearchMixin

  externalActivity: AccountHistory<HistoryItem> = {};
  externalActivityTotalCount = 0;
  pageInfo: Nullable<PageInfo> = null;

  updateCommonHistory = debounce(() => this.updateHistory(true, true), 500);
  filteredInternalHistory: Array<History> = [];

  get assetAddress(): string {
    return (this.asset && this.asset.address) || '';
  }

  get internalHistory(): Array<History> {
    const activityList = Object.values(this.activity);
    const prefiltered = this.assetAddress
      ? activityList.filter((item) => {
          return [item.assetAddress, item.asset2Address].includes(this.assetAddress);
        })
      : activityList;

    return prefiltered;
  }

  get filteredExternalHistory(): Array<History> {
    return Object.values(this.externalActivity);
  }

  get transactions(): Array<History> {
    const merged = [...this.filteredInternalHistory, ...this.filteredExternalHistory];
    const sorted = this.sortTransactions(merged);

    return this.getPageItems(sorted);
  }

  get total(): number {
    return this.externalActivityTotalCount + this.internalHistory.length;
  }

  get hasTransactions(): boolean {
    return !!(this.transactions && this.transactions.length) || !!this.searchQuery;
  }

  get searchQueryOperations(): Array<Operation> {
    if (!this.searchQuery) return [];

    return SubqueryDataParserService.supportedOperations.filter((operation) =>
      this.t(`operations.${operation}`).toLowerCase().includes(this.searchQuery)
    );
  }

  get searchQueryAssetsAddresses(): Array<string> {
    if (!this.searchQuery) return [];

    return this.assets.reduce((buffer: Array<string>, asset) => {
      if (asset.symbol.toLowerCase().includes(this.searchQuery)) {
        buffer.push(asset.address);
      }
      return buffer;
    }, []);
  }

  async mounted() {
    await this.withLoading(async () => {
      await Promise.all([this.getAssets(), this.clearSyncedActivity()]);
      await this.updateHistory();
    });
  }

  resetSearchQueryDependencies(): void {
    this.resetPage();
    this.externalActivity = {};
    this.externalActivityTotalCount = 0;
    this.pageInfo = null;
  }

  getFilteredHistory(history: Array<History>): Array<History> {
    if (!this.searchQuery) {
      return history;
    }

    return history.filter(
      (item) =>
        // asset address criteria
        `${item.assetAddress}`.toLowerCase() === this.searchQuery ||
        `${item.asset2Address}`.toLowerCase() === this.searchQuery ||
        // symbol criteria
        `${item.symbol}`.toLowerCase().includes(this.searchQuery) ||
        `${item.symbol2}`.toLowerCase().includes(this.searchQuery) ||
        // search qriteria
        `${item.blockId}`.toLowerCase().includes(this.searchQuery) ||
        // account address criteria
        `${item.from}`.toLowerCase() === this.searchQuery ||
        `${item.to}`.toLowerCase() === this.searchQuery ||
        // operations criteria
        this.t(`operations.${item.type}`).toLowerCase().includes(this.searchQuery)
    );
  }

  sortTransactions(transactions: Array<History>): Array<History> {
    return transactions.sort((a: History, b: History) => (a.startTime && b.startTime ? b.startTime - a.startTime : 0));
  }

  getStatus(status: string): string {
    if ([TransactionStatus.Error, 'invalid'].includes(status)) {
      status = TransactionStatus.Error;
    } else if (status !== TransactionStatus.Finalized) {
      status = 'in_progress';
    }
    return status.toUpperCase();
  }

  getStatusClass(status: string): string {
    return getStatusClass(this.getStatus(status));
  }

  getStatusIcon(status: string): string {
    return getStatusIcon(this.getStatus(status));
  }

  handleOpenTransactionDetails(id: number): void {
    this.navigate({ name: RouteNames.WalletTransactionDetails, params: { id, asset: this.asset } });
  }

  async handlePaginationClick(current: number): Promise<void> {
    const isNext = current > this.currentPage;
    this.currentPage = current;
    await this.updateHistory(isNext);
  }

  /**
   * Update external & internal history
   */
  async updateHistory(nextPage = true, reset = false): Promise<void> {
    await this.withLoading(async () => {
      if (reset) {
        this.resetSearchQueryDependencies();
      }
      await this.updateExternalHistory(nextPage);
      await this.updateInternalHistory();
    });
  }

  /**
   * Get history from accountStorage, then filter it
   */
  async updateInternalHistory(): Promise<void> {
    await this.getAccountActivity();
    this.filteredInternalHistory = this.getFilteredHistory(this.internalHistory);
  }

  /**
   * Get history from explorer, already filtered
   */
  async updateExternalHistory(isNextPage = true): Promise<void> {
    const {
      assetAddress,
      account: { address },
      pageAmount,
      pageInfo,
      searchQuery: search,
      searchQueryOperations: operations,
      searchQueryAssetsAddresses: assetsAddresses,
    } = this;

    if (pageInfo && ((isNextPage && !pageInfo.hasNextPage) || (!isNextPage && !pageInfo.hasPreviousPage))) return;

    const filter = historyElementsFilter(address, { assetAddress, query: { search, operations, assetsAddresses } });
    const pagination = {
      [isNextPage ? 'after' : 'before']: pageInfo ? (isNextPage ? pageInfo.endCursor : pageInfo.startCursor) || '' : '',
    };

    const variables = {
      filter,
      first: pageAmount,
      ...pagination,
    };

    try {
      const { edges, pageInfo, totalCount } = await SubqueryExplorerService.getAccountTransactions(variables);

      for (const edge of edges) {
        const transaction = edge.node;
        const { id } = transaction;

        if (!(id in this.externalActivity)) {
          const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

          if (historyItem) {
            this.externalActivity = { ...this.externalActivity, [id]: historyItem };
          }
        }

        if (id in this.activity) {
          api.removeHistory(transaction.id);
        }
      }

      this.pageInfo = pageInfo;
      this.externalActivityTotalCount = totalCount;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Clear history items from accountStorage, what exists in explorer
   * This is necessary to get the correct 'total' value.
   */
  private async clearSyncedActivity(): Promise<void> {
    const {
      assetAddress,
      account: { address },
    } = this;
    const timestamp = api.historySyncTimestamp || 0;
    const filter = historyElementsFilter(address, { assetAddress, timestamp });
    const variables = { filter };
    const removeHistoryIds: Array<string> = [];
    try {
      const { edges } = await SubqueryExplorerService.getAccountTransactions(variables, { data: false });
      for (const edge of edges) {
        const historyId = edge.node.id;

        if (historyId in this.activity) {
          removeHistoryIds.push(historyId);
        }
      }
      api.removeHistory(...removeHistoryIds);
      api.historySyncTimestamp = Math.round(Date.now() / 1000);

      await this.getAccountActivity();
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<style lang="scss">
.history {
  margin-top: #{$basic-spacing-medium};
  .el-card__body {
    padding: #{$basic-spacing-medium} #{$basic-spacing-medium} calc(var(--s-basic-spacing) * 2.5);
  }
  .el-pagination {
    .btn {
      &-prev,
      &-next {
        padding-right: 0;
        padding-left: 0;
        min-width: calc(var(--s-basic-spacing) * 2.5);
      }
      &-prev {
        margin-left: auto;
        margin-right: var(--s-basic-spacing);
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

  &--search.el-form-item {
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
  .history--search {
    position: relative;
    .s-button--clear {
      width: 18px;
      height: 18px;
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      border: none;
    }
  }
}
.el-pagination {
  display: flex;
  margin-top: #{$basic-spacing-medium};
  padding-left: 0;
  padding-right: 0;
}
</style>
