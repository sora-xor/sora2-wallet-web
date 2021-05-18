<template>
  <wallet-base :title="t(!selectedTransaction ? 'transaction.title' : 'operations.'+selectedTransaction.type)" show-back @back="handleBack">
    <div class="transaction" v-if="selectedTransaction">
      <div v-if="selectedTransaction.blockId" class="s-input-container">
        <s-input :placeholder="t('transaction.hash')" :value="formatAddress(selectedTransaction.blockId, 24)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="copyTooltip('transaction.hash')"
          type="action"
          @click="handleCopy(selectedTransaction.blockId, t('transaction.hash'))"
        />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item disabled>
              <span>{{ t('transaction.viewInPolkascan') }}</span>
            </s-dropdown-item>
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
      <div v-if="transactionAmount" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.amount') }}
        </div>
        <div class="transaction-row_value">{{ `${transactionAmount} ${selectedTransaction.symbol}` }}</div>
      </div>
      <div v-if="transactionAmount2" class="transaction-row s-flex">
        <div class="transaction-row_key">
          {{ t('transaction.amount2') }}
        </div>
        <div class="transaction-row_value">{{ `${transactionAmount2} ${selectedTransaction.symbol2}` }}</div>
      </div>
      <div v-if="selectedTransaction.from" class="s-input-container">
        <s-input :placeholder="t('transaction.from')" :value="formatAddress(selectedTransaction.from, 24)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="copyTooltip('transaction.from')"
          type="action"
          @click="handleCopy(selectedTransaction.from, t('transaction.from'))"
        />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item disabled>
              <span>{{ t('transaction.viewInPolkascan') }}</span>
            </s-dropdown-item>
          </template>
        </s-dropdown>
      </div>
      <div v-if="selectedTransaction.to" class="s-input-container">
        <s-input :placeholder="t('transaction.to')" :value="formatAddress(selectedTransaction.to, 24)" readonly />
        <s-button
          class="s-button--copy"
          icon="basic-copy-24"
          :tooltip="copyTooltip('transaction.to')"
          type="action"
          @click="handleCopy(selectedTransaction.to, t('transaction.to'))"
        />
        <s-dropdown
          class="s-dropdown--menu"
          borderRadius="mini"
          type="ellipsis"
          icon="basic-more-vertical-24"
          placement="bottom-end"
          @select="handleOpenPolkascan"
        >
          <template slot="menu">
            <s-dropdown-item disabled>
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

import { TransactionStatus, AccountAsset, FPNumber } from '@sora-substrate/util'
import TranslationMixin from './mixins/TranslationMixin'
import CopyAddressMixin from './mixins/CopyAddressMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames, WalletTabs } from '../consts'
import { formatDate, formatAddress, getStatusIcon, getStatusClass, copyToClipboard } from '../util'

@Component({
  components: { WalletBase }
})
export default class WalletTransactionDetails extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Getter currentRouteParams!: any
  @Getter selectedTransaction!: any
  @Getter accountAssets!: Array<AccountAsset>
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

  get transactionAmount (): string | null {
    return this.selectedTransaction.amount ? new FPNumber(this.selectedTransaction.amount).toLocaleString() : null
  }

  get transactionAmount2 (): string | null {
    return this.selectedTransaction.amount2 ? new FPNumber(this.selectedTransaction.amount2).toLocaleString() : null
  }

  handleBack (): void {
    if (this.currentRouteParams.asset) {
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.asset } })
      return
    }
    this.navigate({ name: RouteNames.Wallet, params: { currentTab: WalletTabs.Activity } })
  }

  copyTooltip (value: string): string {
    return this.t('transaction.copy', { value: this.t(value) })
  }

  handleOpenPolkascan (): void {
    // TODO: Add work with Polkascan
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
</style>

<style scoped lang="scss">
$dropdown-right: 15px;
$dropdown-width: var(--s-size-mini);
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
    &_value {
      padding-left: $basic-spacing_small;
      text-align: right;
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
  .s-button--copy {
    position: absolute;
    top: 0;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    right: calc(#{$dropdown-right} + #{$dropdown-width} + #{$basic-spacing_mini / 2});
    z-index: 1;
    &, &:hover, &:focus, &:active {
      background-color: transparent;
      border-color: transparent;
    }
  }
  .s-dropdown--menu {
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
