<template>
  <div class="history s-flex">
    <s-form
      class="history-form"
      :show-message="false"
    >
      <s-form-item v-if="hasHistory" class="history--search">
        <s-input
          v-model="query"
          :placeholder="t('history.filterPlaceholder')"
          prefix="s-icon-search-16"
          size="big"
        >
          <template #suffix v-if="query">
            <s-button class="s-button--clear" :use-design-system="false" @click="handleResetSearch">
              <s-icon name="clear-X-16" />
            </s-button>
          </template>
        </s-input>
      </s-form-item>
      <div class="history-items" v-loading="loading">
        <template v-if="filteredHistory.length">
          <div
            class="history-item s-flex"
            v-for="item in filteredHistory.slice((currentPage - 1) * pageAmount, currentPage * pageAmount)"
            :key="`history-${item.id}`"
            @click="handleOpenTransactionDetails(item.id)"
          >
            <div class="history-item-info">
              <div class="history-item-operation ch3" :data-type="item.type">{{ t(`operations.${item.type}`) }}</div>
              <div class="history-item-title p4">{{ getMessage(item) }}</div>
              <s-icon v-if="item.status !== TransactionStatus.Finalized" :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" />
            </div>
            <div class="history-item-date">{{ formatDate(item.startTime) }}</div>
          </div>
        </template>
        <div v-else class="history-empty p4">{{ t(`history.${hasHistory ? 'emptySearch' : 'empty'}`) }}</div>
      </div>
      <s-pagination
        v-if="hasHistory"
        :layout="'total, prev, next'"
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
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import { AccountAsset, History, TransactionStatus, api } from '@sora-substrate/util'
import LoadingMixin from './mixins/LoadingMixin'
import TransactionMixin from './mixins/TransactionMixin'
import { formatDate, getStatusIcon, getStatusClass } from '../util'
import { RouteNames } from '../consts'

import { SubqueryExplorerService, SubqueryDataParserService } from '../services/subquery'
import { CursorPaginationItems, CursorPaginationDirection } from '../services/types'
import { historyElementsFilter } from '../services/subquery/queries/historyElements'

@Component
export default class WalletHistory extends Mixins(LoadingMixin, TransactionMixin) {
  @Getter activity!: Array<History>
  @Getter account!: any
  @Action navigate
  @Action getAccountActivity

  @Prop() readonly asset?: AccountAsset

  formatDate = formatDate
  TransactionStatus = TransactionStatus
  query = ''
  currentPage = 1
  pageAmount = 8

  historyExplorer = {
    pageInfo: {
      startCursor: '',
      endCursor: ''
    },
    totalCount: 0
  }

  // for fast search
  get activityHashTable (): any {
    return this.activity.reduce((result, item) => {
      return { ...result, [item.txId]: item }
    }, {})
  }

  get assetAddress (): string | undefined {
    return this.asset && this.asset.address
  }

  get transactions (): Array<History> {
    if (this.assetAddress) {
      return this.activity.filter(item => [item.assetAddress, item.asset2Address].includes(this.assetAddress))
    }
    return this.activity
  }

  get filteredHistory (): Array<any> {
    if (!this.hasHistory) return []
    return this.getFilteredHistory(this.transactions).sort((a: History, b: History) => a.startTime && b.startTime ? b.startTime - a.startTime : 0)
  }

  get hasHistory (): boolean {
    return !!(this.transactions && this.transactions.length)
  }

  get total (): number {
    const historyItemsCount = this.filteredHistory.length

    if (this.query) return historyItemsCount

    return Math.max(this.historyExplorer.totalCount, historyItemsCount)
  }

  async mounted () {
    await this.updateHistory()
  }

  getFilteredHistory (history: Array<History>): Array<History> {
    if (!this.query) {
      return history
    }
    const query = this.query.toLowerCase().trim()
    return history.filter(item =>
      `${item.assetAddress}`.toLowerCase().includes(query) ||
      `${item.asset2Address}`.toLowerCase().includes(query) ||
      `${item.symbol}`.toLowerCase().includes(query) ||
      `${item.symbol2}`.toLowerCase().includes(query) ||
      `${item.blockId}`.toLowerCase().includes(query) ||
      `${item.from}`.toLowerCase().includes(query) ||
      `${item.to}`.toLowerCase().includes(query) ||
      this.t(`operations.${item.type}`).toLowerCase().includes(query)
    )
  }

  getStatus (status: string): string {
    if ([TransactionStatus.Error, 'invalid'].includes(status)) {
      status = TransactionStatus.Error
    } else if (status !== TransactionStatus.Finalized) {
      status = 'in_progress'
    }
    return status.toUpperCase()
  }

  getStatusClass (status: string): string {
    return getStatusClass(this.getStatus(status))
  }

  getStatusIcon (status: string): string {
    return getStatusIcon(this.getStatus(status))
  }

  async handlePaginationClick (current: number): Promise<void> {
    const { endCursor, startCursor } = this.historyExplorer.pageInfo
    const isNext = current > this.currentPage
    const cursor = isNext ? endCursor : startCursor
    const cursorDirection = isNext ? CursorPaginationDirection.AFTER : CursorPaginationDirection.BEFORE

    await this.updateHistory({ [cursorDirection]: cursor })

    this.currentPage = current
  }

  handleOpenTransactionDetails (id: number): void {
    this.navigate({ name: RouteNames.WalletTransactionDetails, params: { id, asset: this.asset } })
  }

  handleResetSearch (): void {
    this.query = ''
    this.currentPage = 1
  }

  async updateHistory (params?: any): Promise<void> {
    await this.withLoading(async () => {
      await this.updateHistoryFromExplorer(params)
      await this.getAccountActivity()
    })
  }

  async updateHistoryFromExplorer ({ before = '', after = '' } = {}) {
    const {
      assetAddress,
      account: { address },
      pageAmount,
      query
    } = this

    const filter = historyElementsFilter(address, { assetAddress, query })
    const paginationDirection = before ? CursorPaginationItems.LAST : CursorPaginationItems.FIRST
    const paginationSize = pageAmount // if query used, fetch all items
    const variables = {
      after, // cursor
      before, // cursor
      filter, // filter by account & asset
      [paginationDirection]: paginationSize // pagination size
    }

    try {
      const {
        historyElements: {
          edges,
          pageInfo,
          totalCount
        }
      } = await SubqueryExplorerService.getAccountTransactions(variables)

      this.historyExplorer = { pageInfo, totalCount }

      for (const edge of edges) {
        const transaction = edge.node
        const hasHistoryItem = transaction.id in this.activityHashTable

        if (!hasHistoryItem) {
          const historyItem = await SubqueryDataParserService.parseTransactionAsHistoryItem(transaction)

          if (historyItem) {
            api.saveHistory(historyItem)
          }
        }
      }
    } catch (error) {
      console.error(error)
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
        &--error  {
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
