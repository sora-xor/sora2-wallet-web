<template>
  <wallet-base :title="t('transaction.title')" show-back @back="handleBack">
    <div class="transaction" v-if="selectedTransaction">
      <s-input class="transaction-hash" readonly :placeholder="t('transaction.hash')" :value="selectedTransaction.hash" border-radius="mini" />
      <div v-for="row in dataRows" :key="row.key" class="transaction-row s-flex">
        <div class="transaction-row_key">{{ t(`transaction.${row.key}`) }}</div>
        <div class="transaction-row_value">{{ row.value }}</div>
      </div>
      <s-input class="transaction-from" readonly :placeholder="t('transaction.from')" :value="selectedTransaction.from" border-radius="mini" />
      <s-input class="transaction-to" readonly :placeholder="t('transaction.to')" :value="selectedTransaction.to" border-radius="mini" />
      <template v-if="!!selectedTransaction.history.length">
        <s-divider />
        <div v-for="item in selectedTransaction.history" :key="item.id" class="history s-flex">
          <div class="history-info s-flex">
            <div class="history-info_text">
              {{
                t(
                  `transaction.history.${item.state.toLowerCase()}`,
                  {
                    amount: selectedTransaction.amount,
                    fee: selectedTransaction.fee,
                    symbol: selectedTransaction.symbol
                  }
                )
              }}
            </div>
            <div class="history-info_date">{{ formatDate(item.date) }}</div>
          </div>
          <s-icon :class="getStatusClass(item.status)" :name="getStatusIcon(item.status)" size="20px" />
        </div>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import pick from 'lodash/fp/pick'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { formatDate, getStatusIcon, getStatusClass } from '../util'

@Component({
  components: { WalletBase }
})
export default class WalletTransactionDetails extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any
  @Getter selectedTransaction!: any
  @Action navigate
  @Action getTransactionDetails

  getStatusIcon = getStatusIcon
  getStatusClass = getStatusClass
  formatDate = formatDate

  mounted (): void {
    const id = this.currentRouteParams.id
    if (!id) {
      this.navigate({ name: RouteNames.Wallet })
      return
    }
    this.getTransactionDetails({ id })
  }

  get dataRows (): Array<{ key: string; value: string }> {
    const rows: Array<{ key: string; value: string }> = []
    const params = pick(['status', 'date', 'amount', 'fee'], this.selectedTransaction)
    Object.keys(params).forEach(key => {
      switch (key) {
        case 'status':
          rows.push({ key, value: params.status.toLowerCase() })
          break
        case 'date':
          rows.push({ key, value: formatDate(params.date) })
          break
        default:
          rows.push({ key, value: `${params[key]} ${this.selectedTransaction.symbol}` })
          break
      }
    })
    rows.push({ key: 'total', value: `${params.amount + params.fee} ${this.selectedTransaction.symbol}` })
    return rows
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style scoped lang="scss">
.transaction {
  &-hash, &-from {
    margin-bottom: $basic-spacing_small;
  }
  &-row {
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
