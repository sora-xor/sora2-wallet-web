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
            <a v-for="link in txExplorerLinks" :key="link.type" class="transaction-link" :href="link.value" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t(`transaction.viewIn.${link.type}`) }}
              </s-dropdown-item>
            </a>
          </template>
        </s-dropdown>
      </div>
      <div class="info-line-container">
        <info-line v-if="selectedTransaction.status" :label="t('transaction.status')">
          <span :class="statusClass">{{ statusTitle }}</span>
          <s-icon v-if="isComplete" name="basic-check-mark-24" size="16px" />
        </info-line>
        <info-line v-if="selectedTransaction.errorMessage" :label="t('transaction.errorMessage')">
          <span :class="statusClass">{{ selectedTransaction.errorMessage }}</span>
        </info-line>
        <info-line v-if="selectedTransaction.startTime" :label="t('transaction.startTime')" :value="formatDate(selectedTransaction.startTime)" />
        <info-line v-if="selectedTransaction.amount" :label="t('transaction.amount')">
          <formatted-amount
            class="info-line-value"
            :value="transactionAmount"
            :asset-symbol="selectedTransaction.symbol"
            :font-size-rate="FontSizeRate.MEDIUM"
            :font-weight-rate="FontWeightRate.SMALL"
          >
            <template v-if="isRemoveLiquidityType">
              <span class="formatted-amount__divider">{{ t('operations.andText') }}</span>
              <span class="formatted-amount__symbol">{{ selectedTransaction.symbol2 }}</span>
            </template>
          </formatted-amount>
        </info-line>
        <info-line
          v-if="selectedTransaction.amount2"
          :label="t('transaction.amount2')"
          :value="transactionAmount2"
          :asset-symbol="selectedTransaction.symbol2"
          is-formatted
        />
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
            <a v-for="link in accountExplorerLinks" :key="link.type" class="transaction-link" :href="link.value + selectedTransaction.from" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t(`transaction.viewIn.${link.type}`) }}
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
            <a v-for="link in accountExplorerLinks" :key="link.type" class="transaction-link" :href="link.value + selectedTransaction.to" target="_blank" rel="nofollow noopener">
              <s-dropdown-item class="s-dropdown-menu__item">
                {{ t(`transaction.viewIn.${link.type}`) }}
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
import { TransactionStatus, AccountAsset, Operation, History } from '@sora-substrate/util'

import CopyAddressMixin from './mixins/CopyAddressMixin'
import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import WalletBase from './WalletBase.vue'
import InfoLine from './InfoLine.vue'
import FormattedAmount from './FormattedAmount.vue'
import { RouteNames, WalletTabs, SoraNetwork, ExplorerLink, ExplorerType } from '../consts'
import { FontSizeRate, FontWeightRate } from '../types/common'
import { formatDate, formatAddress, getStatusClass, copyToClipboard, getExplorerLinks } from '../util'

@Component({
  components: {
    WalletBase,
    InfoLine,
    FormattedAmount
  }
})
export default class WalletTransactionDetails extends Mixins(CopyAddressMixin, NumberFormatterMixin) {
  readonly Operation = Operation
  readonly FontSizeRate = FontSizeRate
  readonly FontWeightRate = FontWeightRate

  @Getter soraNetwork!: SoraNetwork
  @Getter currentRouteParams!: any
  @Getter selectedTransaction!: History
  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>
  @Action getAccountActivity!: AsyncVoidFn
  @Action getTransactionDetails!: (id: string) => Promise<void>

  TransactionStatus = TransactionStatus
  getStatusClass = getStatusClass
  formatDate = formatDate
  transaction: any = null

  mounted () {
    const id: string = this.currentRouteParams.id
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
    if ([TransactionStatus.Error, 'invalid'].includes(this.selectedTransaction.status as string)) {
      return this.t('transaction.statuses.failed')
    } else if (this.isComplete) {
      return this.t('transaction.statuses.complete')
    }
    return this.t('transaction.statuses.pending')
  }

  get transactionIdKey (): string {
    return `transaction.${this.selectedTransaction.txId ? 'txId' : 'blockId'}`
  }

  get transactionId (): Nullable<string> {
    return this.selectedTransaction.txId || this.selectedTransaction.blockId
  }

  get transactionAmount (): string {
    return this.formatStringValue(this.selectedTransaction.amount as string)
  }

  get isRemoveLiquidityType (): boolean {
    return this.selectedTransaction.type === Operation.RemoveLiquidity
  }

  get transactionAmount2 (): string {
    return this.formatStringValue(this.selectedTransaction.amount2 as string)
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

  get baseExplorerLinks (): Array<ExplorerLink> {
    return getExplorerLinks(this.soraNetwork)
  }

  get accountExplorerLinks (): Array<ExplorerLink> {
    return this.baseExplorerLinks.map(({ type, value }) => ({ type, value: `${value}/account/` }))
  }

  get txExplorerLinks (): Array<ExplorerLink> {
    return this.baseExplorerLinks.map(({ type, value }) => {
      const link = { type } as ExplorerLink
      if (!this.selectedTransaction.txId) {
        link.value = `${value}/block/${this.transactionId}`
      } else if (type === ExplorerType.Sorascan) {
        link.value = `${value}/transaction/${this.transactionId}`
      } else {
        link.value = `${value}/extrinsic/${this.transactionId}`
      }
      return link
    })
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
  .s-icon-basic-check-mark-24 {
    margin-left: var(--s-basic-spacing);
  }
  &-link {
    color: inherit;
    text-decoration: none;
  }
  .s-input-container {
    position: relative;
    + .s-input-container {
      margin-top: var(--s-basic-spacing);
    }
  }
  .info-line-container {
    margin-bottom: #{$basic-spacing-medium};
  }
  .s-button--copy {
    position: absolute;
    top: 0;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    right: calc(#{$dropdown-right} + #{$dropdown-width} + #{$basic-spacing-mini});
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
  .formatted-amount__divider {
    margin-right: #{$basic-spacing-extra-mini};
    margin-left: #{$basic-spacing-extra-mini};
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
