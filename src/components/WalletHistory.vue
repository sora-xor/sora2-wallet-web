<template>
  <div class="history s-flex">
    <s-form class="history-form" :show-message="false">
      <s-form-item v-if="hasHistory" class="history--search">
        <s-input v-model="query" :placeholder="t('history.filterPlaceholder')" prefix="s-icon-search-16" size="big">
          <template #suffix v-if="query">
            <s-button class="s-button--clear" :use-design-system="false" @click="resetSearch">
              <s-icon name="clear-X-16" />
            </s-button>
          </template>
        </s-input>
      </s-form-item>
      <button type="button" @click="testItems">Test items</button>
      <div class="history-items" v-loading="loading">
        <template v-if="filteredHistory.length">
          <div
            class="history-item s-flex"
            v-for="item in filteredHistory"
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
        <div v-else class="history-empty p4">{{ t(`history.${hasHistory ? 'emptySearch' : 'empty'}`) }}</div>
      </div>
      <s-pagination
        v-if="hasHistory"
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
import omit from 'lodash/fp/omit';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import { History, TransactionStatus } from '@sora-substrate/util';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../api';
import LoadingMixin from './mixins/LoadingMixin';
import TransactionMixin from './mixins/TransactionMixin';
import PaginationSearchMixin from './mixins/PaginationSearchMixin';
import { getStatusIcon, getStatusClass } from '../util';
import { RouteNames } from '../consts';
import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery';
import { historyElementsFilter } from '../services/subquery/queries/historyElements';

@Component
export default class WalletHistory extends Mixins(LoadingMixin, TransactionMixin, PaginationSearchMixin) {
  @Getter activity!: AccountHistory<HistoryItem>;
  @Getter shouldBalanceBeHidden!: boolean;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getAccountActivity!: AsyncVoidFn;

  @Prop() readonly asset?: AccountAsset;

  TransactionStatus = TransactionStatus;

  pageAmount = 8; // override PaginationSearchMixin
  pageInfo: any = {};
  totalCount = 0;
  externalHistory: Array<History> = [];

  get assetAddress(): string {
    return (this.asset && this.asset.address) || '';
  }

  get internalHistory(): Array<History> {
    return Object.values(this.activity);
  }

  get transactions(): Array<History> {
    return [...this.internalHistory, ...this.externalHistory];
  }

  get hasHistory(): boolean {
    return !!(this.transactions && this.transactions.length);
  }

  get sortedTransactions(): Array<History> {
    return [...this.transactions].sort((a: History, b: History) =>
      a.startTime && b.startTime ? b.startTime - a.startTime : 0
    );
  }

  get filteredHistory(): Array<History> {
    return this.getFilteredHistory(this.sortedTransactions);
  }

  get total(): number {
    return Math.max(this.filteredHistory.length, this.totalCount);
  }

  async mounted() {
    await this.clearSyncedActivity();
    await this.updateHistory();
  }

  async clearSyncedActivity(): Promise<void> {
    await this.withLoading(async () => {
      const timestamp = api.historySyncTimestamp || 0;
      const filter = historyElementsFilter(this.account.address, { timestamp });
      const variables = { filter };
      const removeHistoryIds = [];
      try {
        const { edges } = await SubqueryExplorerService.getAccountTransactions(variables);
        for (const edge of edges) {
          const historyId = edge.node.id;

          if (historyId in this.activity) {
            removeHistoryIds.push(historyId);
          }
        }
        // api.removeHistory(removeHistoryIds);
        // api.historySyncTimestamp = Date.now();
      } catch (error) {
        console.error(error);
      }
    });
  }

  testItems() {
    const testItem = this.transactions[0];
    const result = { ...this.activity };

    for (let i = 0; i <= 1000; i++) {
      const startTime = Date.now() + Math.floor(Math.random() * 100);
      const id = api.encrypt(String(startTime));
      result[id] = { ...testItem, id, startTime, endTime: startTime + 1 };
    }

    api.history = result;
  }

  resetSearch() {
    this.handleResetSearch();
  }

  getFilteredHistory(history: Array<History>): Array<History> {
    if (!this.query) {
      return history;
    }
    const query = this.query.toLowerCase().trim();
    return history.filter(
      (item) =>
        (this.assetAddress ? `${item.assetAddress}`.toLowerCase().includes(this.assetAddress) : false) ||
        (this.assetAddress ? `${item.asset2Address}`.toLowerCase().includes(this.assetAddress) : false) ||
        `${item.assetAddress}`.toLowerCase().includes(query) ||
        `${item.asset2Address}`.toLowerCase().includes(query) ||
        `${item.symbol}`.toLowerCase().includes(query) ||
        `${item.symbol2}`.toLowerCase().includes(query) ||
        `${item.blockId}`.toLowerCase().includes(query) ||
        `${item.from}`.toLowerCase().includes(query) ||
        `${item.to}`.toLowerCase().includes(query) ||
        this.t(`operations.${item.type}`).toLowerCase().includes(query)
    );
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

  async updateHistory(nextPage = true): Promise<void> {
    await this.withLoading(async () => {
      await this.updateHistoryFromExplorer(nextPage);
      await this.getAccountActivity();
    });
  }

  async updateHistoryFromExplorer(nextPage = true): Promise<void> {
    const {
      assetAddress,
      account: { address },
      pageAmount,
      pageInfo,
    } = this;

    if (this.totalCount && this.startIndex > this.totalCount) return;

    const filter = historyElementsFilter(address, { assetAddress });
    const pagination = {
      [nextPage ? 'after' : 'before']: (nextPage ? pageInfo.endCursor : pageInfo.startCursor) || '',
    };

    const variables = {
      first: pageAmount,
      filter, // filter by account & asset
      ...pagination,
    };

    this.externalHistory = [];

    try {
      const { edges, pageInfo, totalCount } = await SubqueryExplorerService.getAccountTransactions(variables);
      const buffer: Array<History> = [];

      this.pageInfo = pageInfo;
      this.totalCount = totalCount;

      for (const edge of edges) {
        const transaction = edge.node;
        const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction);

        if (historyItem) {
          buffer.push(historyItem);
        }

        if (transaction.id in this.activity) {
          api.removeHistory(transaction.id);
        }
      }

      this.externalHistory = buffer;
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
