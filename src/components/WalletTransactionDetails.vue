<template>
  <wallet-base :title="t(`${!selectedTransaction ? 'transaction.title' : 'operations.'+selectedTransaction.type}`)" show-back @back="handleBack">
    <div class="transaction" v-if="selectedTransaction">
      <div v-if="selectedTransaction.blockId" class="s-input-container">
        <s-input :placeholder="t('transaction.hash')" :value="formatAddress(selectedTransaction.blockId)" readonly />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item>
              <span>{{ t('transaction.viewInPolkascan') }}</span>
            </s-dropdown-item>
          </template>
        </s-dropdown>
      </div>
      <div v-for="row in dataRows" :key="row.key" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t(`transaction.${row.key}`) }}
        </div>
        <div class="transaction-row_value" v-html="row.value" />
        <s-icon v-if="row.key === 'status' && isComplete" name="basic-check-mark-24" />
      </div>
      <div v-if="selectedTransaction.from" class="s-input-container">
        <s-input :placeholder="t('transaction.from')" :value="formatAddress(selectedTransaction.from)" readonly />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item>
              <span>{{ t('transaction.viewInPolkascan') }}</span>
            </s-dropdown-item>
          </template>
        </s-dropdown>
      </div>
      <div v-if="selectedTransaction.to" class="s-input-container">
        <s-input :placeholder="t('transaction.to')" :value="formatAddress(selectedTransaction.to)" readonly />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item>
              <span>{{ t('transaction.viewInPolkascan') }}</span>
            </s-dropdown-item>
          </template>
        </s-dropdown>
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import pick from 'lodash/fp/pick'

import { TransactionStatus } from '@sora-substrate/util'
import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { formatDate, formatAddress, getStatusIcon, getStatusClass } from '../util'

@Component({
  components: { WalletBase }
})
export default class WalletTransactionDetails extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any
  @Getter selectedTransaction!: any
  @Action navigate
  @Action getAccountActivity
  @Action getTransactionDetails

  getStatusIcon = getStatusIcon
  TransactionStatus = TransactionStatus
  getStatusClass = getStatusClass
  formatDate = formatDate
  formatAddress = formatAddress
  transaction: any = null

  mounted () {
    const id = this.currentRouteParams.id
    if (!id) {
      this.navigate({ name: RouteNames.Wallet })
    }
    this.getAccountActivity()
    this.getTransactionDetails(id)
  }

  get statusClass (): string {
    const baseClass = 'transaction-status'
    const classes = [baseClass]

    if (this.selectedTransaction.status === 'error') {
      classes.push(`${baseClass}--error`)
    }

    return classes.join(' ')
  }

  get isComplete (): boolean {
    return [TransactionStatus.Finalized, 'done'].includes(this.selectedTransaction.status as TransactionStatus)
  }

  get statusTitle (): string {
    if ([TransactionStatus.Error, 'invalid'].includes(this.selectedTransaction.status)) {
      return this.t('transaction.statuses.failed')
    } else if (this.isComplete) {
      return this.t('transaction.statuses.complete')
    }
    return this.t('transaction.statuses.pending')
  }

  get dataRows (): Array<{ key: string; value: string }> {
    const rows: Array<{ key: string; value: string }> = []
    const params = pick(['status', 'errorMessage', 'startTime', 'amount', 'amount2'], this.selectedTransaction)
    Object.keys(params).forEach(key => {
      switch (key) {
        case 'status':
          rows.push({ key, value: `<span class="${this.statusClass}">${this.statusTitle}</span><s-icon v-if="item.status !== TransactionStatus.Finalized" :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" />` })
          break
        case 'errorMessage':
          // TODO: Add all error messages to translation
          rows.push({ key, value: `<span class="${this.statusClass}">${this.selectedTransaction.errorMessage}</span>` })
          break
        case 'startTime':
          rows.push({ key, value: formatDate(params.startTime) })
          break
        case 'amount':
          rows.push({ key, value: `${params[key]} ${this.selectedTransaction.symbol}` })
          break
        case 'amount2':
          rows.push({ key, value: `${params[key]} ${this.selectedTransaction.symbol2}` })
          break
        default:
          rows.push({ key, value: `${params[key]}` })
          break
      }
    })
    // We don't have total right now
    // rows.push({ key: 'total', value: `${params.amount + params.fee} ${this.selectedTransaction.symbol}` })
    return rows
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleOpenPolkascan (): void {
    // TODO: Add work with Polkascan
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
  &-hash, &-from {
    margin-bottom: $basic-spacing_small;
  }
  &-row {
    align-items: center;
    padding-right: $basic-spacing_mini;
    padding-left: $basic-spacing_mini;
    color: var(--s-color-base-content-secondary);
    &_key {
      flex: 1;
    }
    &:not(:last-child) {
      margin-bottom: $basic-spacing_mini;
    }
    &:last-child {
      margin-bottom: $basic-spacing_small;
    }
    .s-icon-basic-check-mark-24 {
      margin-left: $basic-spacing_mini;
    }
  }
  .s-input-container {
    position: relative;
    margin-bottom: $basic-spacing_small;
  }
  .s-dropdown--menu {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 15px;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    width: var(--s-size-mini);
    height: var(--s-size-mini);
    line-height: 1;
  }
}
.history {
  align-items: center;
  &-info {
    flex: 1;
    flex-direction: column;
    font-size: $font-size_small;
    &_date {
      color: var(--s-color-base-content-tertiary);
    }
  }
  &:not(:last-child) {
    margin-bottom: $basic-spacing_mini;
  }
}
.info-status {
  &--success {
    color: var(--s-color-status-success);
  }
  &--error {
    color: var(--s-color-status-error);
  }
}
</style>
