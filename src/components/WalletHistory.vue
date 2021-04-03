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
          prefix="el-icon-search"
          size="medium"
          border-radius="mini"
        >
          <template #suffix>
            <s-button class="s-button--clear" icon="clear-X-16" @click="handleResetSearch" />
          </template>
        </s-input>
      </s-form-item>
      <div class="history-items">
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
              <s-icon v-if="getStatusIcon(item.status)" :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" />
              <span v-else :class="getStatusClass(item.status)" />
            </div>
            <div class="history-item-date">{{ formatDate(item.startTime) }}</div>
            <!-- This link was hidden due to PSS-205 task. We'll return it back later.  -->
            <!-- <s-button
            class="info-text-explorer"
            type="link"
            size="small"
            @click="handleOpenBlockExplorer(item)"
            >
            <s-icon name="external-link" size="16px" />
            </s-button> -->
          </div>
        </template>
        <div v-else class="history-empty p4">{{ t(`history.${hasHistory ? 'emptySearch' : 'empty'}`) }}</div>
      </div>
      <s-pagination
        v-if="hasHistory"
        :layout="'total, prev, next'"
        :current-page.sync="currentPage"
        :page-size="8"
        :total="filteredHistory.length"
        @prev-click="handlePrevClick"
        @next-click="handleNextClick"
      />
    </s-form>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import { History, TransactionStatus } from '@sora-substrate/util'
import LoadingMixin from './mixins/LoadingMixin'
import TransactionMixin from './mixins/TransactionMixin'
import { formatDate, getStatusIcon, getStatusClass } from '../util'
import { RouteNames } from '../consts'

@Component
export default class WalletHistory extends Mixins(LoadingMixin, TransactionMixin) {
  @Getter activity!: Array<History>
  @Action navigate
  @Action getAccountActivity

  @Prop() readonly assetAddress?: string

  formatDate = formatDate
  query = ''
  currentPage = 1
  pageAmount = 8

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
    return !(this.transactions && this.transactions.length)
  }

  mounted () {
    this.getAccountActivity()
  }

  getFilteredHistory (history: Array<any>): Array<any> {
    if (this.query) {
      const query = this.query.toLowerCase().trim()
      console.log('query', this.query)
      return history.filter(item =>
        `${item.assetAddress}`.toLowerCase().includes(query) ||
        `${item.asset2Address}`.toLowerCase().includes(query) ||
        `${item.symbol}`.toLowerCase().includes(query) ||
        `${item.symbol2}`.toLowerCase().includes(query)
      )
    }

    return history
  }

  getStatusClass (status: string): string {
    if (status === 'invalid') {
      status = TransactionStatus.Error
    } else if ([TransactionStatus.Finalized, 'done'].includes(status)) {
      status = 'success'
    } else if (![TransactionStatus.Finalized, TransactionStatus.Error].includes(status as TransactionStatus)) {
      status = 'in_progress'
    }
    return getStatusClass(status.toUpperCase())
  }

  getStatusIcon (status: string): string {
    if (status === 'invalid') {
      status = TransactionStatus.Error
    } else if (![TransactionStatus.Finalized, TransactionStatus.Error].includes(status as TransactionStatus)) {
      status = 'in_progress'
    }
    return getStatusIcon(status.toUpperCase())
  }

  handleOpenBlockExplorer (item: any): void {
    // TODO: Add event handling
    this.$emit('block-explorer', item)
  }

  handlePrevClick (current: number): void {
    this.currentPage = current
  }

  handleNextClick (current: number): void {
    this.currentPage = current
  }

  handleOpenTransactionDetails (id: number): void {
    this.navigate({ name: RouteNames.WalletTransactionDetails, params: { id } })
  }

  handleResetSearch (): void {
    this.query = ''
    this.currentPage = 1
  }
}
</script>

<style lang="scss">
.history {
  .el-card__body {
    padding: $basic-spacing $basic-spacing $basic-spacing_big;
  }
  .el-pagination {
    .btn {
      &-prev,
      &-next {
        padding-right: 0;
        padding-left: 0;
        min-width: $basic-spacing_big;
      }
      &-prev {
        margin-left: auto;
        margin-right: $basic-spacing_mini;
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
    margin-bottom: $basic-spacing;
  }
  &-items {
    height: #{$history-item-height * 8};
  }
  &-item {
    display: flex;
    flex-direction: column;
    margin-right: -#{$history-item-horizontal-space * 2};
    margin-left: -#{$history-item-horizontal-space * 2};
    height: $history-item-height;
    padding: #{$basic-spacing / 2 + $history-item-top-border-height} $history-item-horizontal-space * 2 $basic-spacing;
    font-size: var(--s-font-size-mini);
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
      &:before, & + .history-item::before {
        width: 100%;
      }
    }
    &-info {
      display: flex;
      align-items: center;
      .info-status--error  {
        color: var(--s-color-status-error);
      }
    }
    &-title {
      line-height: 1;
    }
    &-title,
    &-date {
      width: 100%;
    }
    &-date {
      margin-top: $basic-spacing_mini / 2;
      line-height: var(--s-line-height-mini);
      color: var(--s-color-base-content-tetriary);
    }
    &-operation {
      flex-shrink: 0;
      color: var(--s-color-base-content-secondary);
      background-color: var(--s-color-base-background);
      border-radius: var(--s-border-radius-mini);
      padding: 0 $basic-spacing_mini / 2;
      margin-right: $basic-spacing_mini / 2;
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
      margin-top: $basic-spacing_mini / 2;
      margin-right: $basic-spacing_mini;
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
      width: 32px;
      margin-right: -8px;
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      border: none;
    }
  }
}
.el-pagination {
  display: flex;
  margin-top: $basic-spacing;
  padding-left: 0;
  padding-right: 0;
}
</style>
