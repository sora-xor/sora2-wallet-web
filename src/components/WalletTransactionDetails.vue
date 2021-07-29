<template>
  <wallet-base :title="t(!selectedTransaction ? 'transaction.title' : `operations.${selectedTransaction.type}`)" show-back @back="handleBack">
    <div class="transaction" v-if="selectedTransaction">
      <div v-if="transactionId" class="s-input-container">
        <s-input :placeholder="t(transactionIdKey)" :value="formatAddress(transactionId)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="getOperationTooltip(transactionIdKey)"
          type="action"
          alternative
          @click="handleCopy(transactionId, t(transactionIdKey))"
        />
        <s-dropdown
          class="s-dropdown-menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
        >
          <template slot="menu">
            <a class="transaction-link" :href="getBlockExplorerLink(transactionIdExplorerCode, transactionId)" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t('transaction.viewInSorascan') }}
              </s-dropdown-item>
            </a>
          </template>
        </s-dropdown>
      </div>
      <div v-if="selectedTransaction.status" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.status') }}
        </div>
        <div class="transaction-row_value">
          <span :class="statusClass">{{ statusTitle }}</span>
        </div>
        <s-icon v-if="isComplete" name="basic-check-mark-24" />
      </div>
      <div v-if="selectedTransaction.errorMessage" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.errorMessage') }}
        </div>
        <div class="transaction-row_value">
          <!--  TODO: Add all error messages to translation -->
          <span :class="statusClass">{{ selectedTransaction.errorMessage }}</span>
        </div>
      </div>
      <div v-if="selectedTransaction.startTime" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.startTime') }}
        </div>
        <div class="transaction-row_value">{{ formatDate(selectedTransaction.startTime) }}</div>
      </div>
      <div v-if="formattedAmount" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.amount') }}
        </div>
        <div class="transaction-row_value">{{ formattedAmount }}</div>
      </div>
      <div v-if="transactionAmount2" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.amount2') }}
        </div>
        <div class="transaction-row_value">{{ transactionAmount2 }}</div>
      </div>
      <div v-if="selectedTransaction.from" class="s-input-container">
        <s-input :placeholder="t('transaction.from')" :value="formatAddress(selectedTransaction.from)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="getOperationTooltip('transaction.from')"
          type="action"
          alternative
          @click="handleCopy(selectedTransaction.from, t('transaction.from'))"
        />
        <s-dropdown
          class="s-dropdown-menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
        >
          <template slot="menu">
            <a class="transaction-link" :href="getBlockExplorerLink('account', selectedTransaction.from)" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t('transaction.viewInSorascan') }}
              </s-dropdown-item>
            </a>
          </template>
        </s-dropdown>
      </div>
      <div v-if="selectedTransaction.to" class="s-input-container">
        <s-input :placeholder="t('transaction.to')" :value="formatAddress(selectedTransaction.to)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="getOperationTooltip('transaction.to')"
          type="action"
          alternative
          @click="handleCopy(selectedTransaction.to, t('transaction.to'))"
        />
        <s-dropdown
          class="s-dropdown-menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
        >
          <template slot="menu">
            <a class="transaction-link" :href="getBlockExplorerLink('account', selectedTransaction.to)" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t('transaction.viewInSorascan') }}
              </s-dropdown-item>
            </a>
          </template>
        </s-dropdown>
      </div>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import { TransactionStatus, AccountAsset, Operation } from '@sora-substrate/util'
import CopyAddressMixin from './mixins/CopyAddressMixin'
import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, WalletTabs } from '../consts'
import { formatDate, formatAddress, getStatusClass, copyToClipboard, getExplorerLink } from '../util'

import { externalStore } from '../index'

@Component({
  components: { WalletBase }
})
export default class WalletTransactionDetails extends Mixins(CopyAddressMixin, NumberFormatterMixin) {
  readonly Operation = Operation

  @Getter currentRouteParams!: any
  @Getter selectedTransaction!: any
  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate
  @Action getAccountActivity
  @Action getTransactionDetails

  TransactionStatus = TransactionStatus
  getStatusClass = getStatusClass
  formatDate = formatDate
  transaction: any = null

  mounted () {
    const id = this.currentRouteParams.id
    if (!id) {
      this.navigate({ name: RouteNames.Wallet })
    }
    this.getAccountActivity()
    this.getTransactionDetails(id)
  }

  get asset (): AccountAsset {
    // currentRouteParams.asset was added here to avoid a case when the asset is not found
    return this.accountAssets.find(({ address }) => address === this.currentRouteParams.asset.address) || this.currentRouteParams.asset as AccountAsset
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

  get transactionIdKey (): string {
    return `transaction.${this.selectedTransaction.txId ? 'txId' : 'blockId'}`
  }

  get transactionId (): string {
    return this.selectedTransaction.txId || this.selectedTransaction.blockId
  }

  get transactionIdExplorerCode (): string {
    return this.selectedTransaction.txId ? 'transaction' : 'block'
  }

  get formattedAmount (): string {
    if (!this.selectedTransaction || !this.selectedTransaction.amount) {
      return ''
    }
    const amount = this.formatStringValue(this.selectedTransaction.amount)
    const firstSymbol = this.selectedTransaction.symbol
    if (this.selectedTransaction.type === Operation.RemoveLiquidity) {
      return `${amount} ${firstSymbol} ${this.t('operations.andText')} ${this.selectedTransaction.symbol2}`
    }
    return `${amount} ${firstSymbol}`
  }

  get transactionAmount2 (): string | null {
    return this.selectedTransaction.amount2 ? `${this.formatStringValue(this.selectedTransaction.amount2)} ${this.selectedTransaction.symbol2}` : null
  }

  formatAddress (address: string): string {
    return formatAddress(address, 24)
  }

  handleBack (): void {
    if (this.currentRouteParams.asset) {
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.asset } })
      return
    }
    this.navigate({ name: RouteNames.Wallet, params: { currentTab: WalletTabs.Activity } })
  }

  getOperationTooltip (value: string): string {
    return this.t('transaction.copy', { value: this.t(value) })
  }

  getBlockExplorerLink (key: string, value: string): string {
    // TODO: move soraNetwork to the wallet
    const networkType = externalStore ? externalStore.getters.soraNetwork : undefined
    return `${getExplorerLink(networkType)}/${key}/${value}`
  }

  async handleCopy (address: string, value: string): Promise<void> {
    try {
      await copyToClipboard(address)
      this.$notify({
        message: this.t('transaction.successCopy', { value: value }),
        type: 'success',
        title: ''
      })
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: ''
      })
    }
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
// TODO: fix UI library
.s-dropdown-menu__item {
  border-radius: calc(var(--s-border-radius-mini) / 2);
}
</style>

<style scoped lang="scss">
$dropdown-right: 15px;
$dropdown-width: var(--s-size-mini);
.transaction {
  &-row {
    align-items: center;
    padding-right: var(--s-basic-spacing);
    padding-left: var(--s-basic-spacing);
    color: var(--s-color-base-content-secondary);
    &_key {
      flex: 1;
    }
    &_value {
      padding-left: calc(var(--s-basic-spacing) * 1.5);
      text-align: right;
    }
    &:not(:last-child) {
      margin-bottom: var(--s-basic-spacing);
    }
    &:last-child {
      margin-bottom: calc(var(--s-basic-spacing) * 1.5);
    }
    .s-icon-basic-check-mark-24 {
      margin-left: var(--s-basic-spacing);
    }
  }
  &-link {
    color: inherit;
    text-decoration: none;
  }
  .s-input-container {
    position: relative;
    margin-bottom: calc(var(--s-basic-spacing) * 1.5);
  }
  .s-button--copy {
    position: absolute;
    top: 0;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    right: calc(#{$dropdown-right} + #{$dropdown-width} + $basic-spacing-mini);
    z-index: 1;
    &, &:hover, &:focus, &:active {
      background-color: transparent;
      border-color: transparent;
    }
  }
  .s-dropdown-menu {
    position: absolute;
    z-index: 1;
    top: 0;
    right: $dropdown-right;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    width: $dropdown-width;
    height: var(--s-size-mini);
    line-height: 1;
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
.info-status {
  &--success {
    color: var(--s-color-status-success);
  }
  &--error {
    color: var(--s-color-status-error);
  }
}
</style>
