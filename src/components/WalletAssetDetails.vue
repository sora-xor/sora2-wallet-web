<template>
  <wallet-base
    :title="asset.name"
    show-back
    show-clean-history
    :show-action="!isXor"
    action-icon="basic-eye-24"
    action-tooltip="asset.remove"
    :disabled-clean-history="isCleanHistoryDisabled"
    @back="handleBack"
    @action="handleRemoveAsset"
    @cleanHistory="handleCleanHistory"
  >
    <s-card class="asset-details" primary>
      <div class="asset-details-container s-flex">
        <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
        <div :style="balanceStyles" :class="balanceDetailsClasses" @click="isXor && handleClickDetailedBalance()">{{ balance }}
          <s-icon v-if="isXor" name="chevron-down-rounded-16" size="18" />
        </div>
        <fiat-value v-if="price" :value="getFiatAmount(asset)" />
        <div class="asset-details-actions">
          <s-button
            v-for="operation in operations"
            :key="operation.type"
            :tooltip="getOperationTooltip(operation)"
            :disabled="isOperationDisabled(operation.type)"
            type="primary"
            size="medium"
            rounded
            @click="handleOperation(operation.type)"
          >
            <s-icon :name="operation.icon" />
          </s-button>
        </div>
        <div v-if="isXor && wasBalanceDetailsClicked" class="asset-details-balance-info">
          <div v-for="type in balanceTypes" :key="type" class="balance s-flex p4">
            <div class="balance-label">{{ t(`assets.balance.${type}`) }}</div>
            <div class="balance-value">{{ formatBalance(asset.balance[type]) }}</div>
            <fiat-value v-if="price" :value="getFiatAmount(asset, type)" :withLeftShift="true" />
          </div>
          <div class="balance s-flex p4">
            <div class="balance-label balance-label--total">{{ t('assets.balance.total') }}</div>
            <div class="balance-value">{{ totalBalance }}</div>
            <fiat-value v-if="price" :value="getFiatAmount(asset, BalanceTypes.Total)" :withLeftShift="true" />
          </div>
        </div>
      </div>
    </s-card>
    <wallet-history :asset="asset" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, CodecString, KnownAssets, KnownSymbols, History } from '@sora-substrate/util'

import { api } from '../api'
import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import FiatValueMixin from './mixins/FiatValueMixin'
import CopyAddressMixin from './mixins/CopyAddressMixin'
import WalletBase from './WalletBase.vue'
import FiatValue from './FiatValue.vue'
import WalletHistory from './WalletHistory.vue'
import { RouteNames } from '../consts'
import { getAssetIconStyles } from '../util'
import { Operations, BalanceTypes } from '../types'

interface Operation {
  type: Operations;
  icon: string;
}

@Component({
  components: { WalletBase, FiatValue, WalletHistory }
})
export default class WalletAssetDetails extends Mixins(NumberFormatterMixin, FiatValueMixin, CopyAddressMixin) {
  readonly balanceTypes = Object.values(BalanceTypes).filter(type => type !== BalanceTypes.Total)
  readonly operations = [
    { type: Operations.Send, icon: 'finance-send-24' },
    { type: Operations.Receive, icon: 'basic-receive-24' },
    { type: Operations.Swap, icon: 'arrows-swap-24' },
    { type: Operations.Liquidity, icon: 'basic-drop-24' },
    { type: Operations.Bridge, icon: 'grid-block-distribute-vertically-24' }
  ] as Array<Operation>

  @Getter account!: any
  @Getter accountAssets!: Array<AccountAsset>
  @Getter currentRouteParams!: any
  @Getter selectedAssetDetails!: Array<any>
  @Getter activity!: Array<History | any>
  @Action navigate
  @Action getAccountActivity

  wasBalanceDetailsClicked = false
  BalanceTypes = BalanceTypes

  private formatBalance (value: CodecString): string {
    return `${this.formatCodecNumber(value, this.asset.decimals)} ${this.asset.symbol}`
  }

  get price (): CodecString | null {
    return this.getAssetFiatPrice(this.asset)
  }

  get asset (): AccountAsset {
    // currentRouteParams.asset was added here to avoid a case when the asset is not found
    return this.accountAssets.find(({ address }) => address === this.currentRouteParams.asset.address) || this.currentRouteParams.asset as AccountAsset
  }

  get balance (): string {
    return this.formatBalance(this.asset.balance.transferable)
  }

  get totalBalance (): string {
    return this.formatBalance(this.asset.balance.total)
  }

  get isEmptyBalance (): boolean {
    return this.isCodecZero(this.asset.balance.transferable, this.asset.decimals)
  }

  get balanceStyles (): object {
    const balanceLength = this.balance.length
    // We've decided to calcutate font size values manually
    let fontSize = 30
    if (balanceLength > 35) {
      fontSize = 14
    } else if (balanceLength > 24 && balanceLength <= 35) {
      fontSize = 16
    } else if (balanceLength > 17 && balanceLength <= 24) {
      fontSize = 20
    }
    return { fontSize: `${fontSize}px` }
  }

  get balanceDetailsClasses (): Array<string> {
    const cssClasses: Array<string> = ['asset-details-balance', 'd2']
    if (this.isXor) {
      cssClasses.push('asset-details-balance--clickable')
    }
    if (this.wasBalanceDetailsClicked) {
      cssClasses.push('asset-details-balance--clicked')
    }
    return cssClasses
  }

  get isXor (): boolean {
    const asset = KnownAssets.get(this.asset.address)
    return asset && asset.symbol === KnownSymbols.XOR
  }

  get isCleanHistoryDisabled (): boolean {
    return !this.asset ? true : !this.activity.filter(item => [item.assetAddress, item.asset2Address].includes(this.asset.address)).length
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  getOperationTooltip (operation: Operation): string {
    if (operation.type !== Operations.Receive || !this.wasAddressCopied) {
      return this.t(`assets.${operation.type}`)
    }
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    return this.t('assets.copied')
  }

  isOperationDisabled (operation: Operations): boolean {
    return operation === Operations.Send && this.isEmptyBalance
  }

  handleOperation (operation: Operations): void {
    switch (operation) {
      case Operations.Send:
        this.navigate({ name: RouteNames.WalletSend, params: { asset: this.asset } })
        break
      case Operations.Receive:
        this.handleCopyAddress(this.account.address)
        break
      default:
        this.$emit(operation, this.asset)
        break
    }
  }

  handleClickDetailedBalance (): void {
    this.wasBalanceDetailsClicked = !this.wasBalanceDetailsClicked
  }

  getAssetIconStyles = getAssetIconStyles

  getBalance (asset: AccountAsset, type: BalanceTypes): string {
    return `${this.formatCodecNumber(asset.balance[type], asset.decimals)}`
  }

  handleRemoveAsset (): void {
    api.removeAsset(this.asset.address)
    this.handleBack()
  }

  handleCleanHistory (): void {
    if (!this.asset) return
    api.clearHistory(this.asset.address)
    this.getAccountActivity()
  }
}
</script>

<style lang="scss">
$asset-details-class: '.asset-details';
#{$asset-details-class}-container {
  #{$asset-details-class}-balance {
    + .fiat-value {
      font-size: var(--s-font-size-medium);
      &__prefix {
        font-weight: 600;
      }
      &__decimals {
        font-size: var(--s-font-size-small);
      }
    }
    &-info {
      .fiat-value {
        font-size: var(--s-font-size-extra-small);
        font-weight: 400;
        &__number,
        &__decimals {
          font-weight: inherit;
        }
        &__number {
          font-size: inherit;
        }
        &__decimals {
          font-size: var(--s-font-size-extra-mini);
        }
      }
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

.asset-details {
  margin-bottom: 0;
  &.s-card.neumorphic {
    padding-top: 0;
    padding-bottom: 0;
  }
  &-container {
    flex-direction: column;
    align-items: center;
    .fiat-value + .asset-details-actions {
      margin-top: calc(var(--s-basic-spacing) * 1.5);
    }
  }
  &-balance {
    position: relative;
    margin-top: var(--s-basic-spacing);
    &--clickable {
      cursor: pointer;
    }
    .s-icon-chevron-down-rounded-16 {
      position: absolute;
      top: 25%;
      height: var(--s-icon-font-size-small);
      width: var(--s-icon-font-size-small);
      transition: transform 0.3s;
      background-color: var(--s-color-base-content-secondary);
      color: var(--s-color-base-on-accent);
      border-radius: 50%;
      margin-left: var(--s-basic-spacing);
    }
    &--clicked .s-icon-chevron-down-rounded-16 {
      padding-right: calc(var(--s-basic-spacing) * 1.5);
      transform: rotate(180deg);
    }
    &-info {
      width: 100%;
      margin-top: calc(var(--s-basic-spacing) * 2);
      .balance {
        justify-content: space-between;
        margin-bottom: calc(var(--s-basic-spacing) / 2);
        border-bottom: 1px solid var(--s-color-base-border-secondary);
        &-label {
          text-transform: uppercase;
        }
        &-label--total,
        &-value {
          font-weight: 600;
        }
        &-value {
          margin-left: auto;
        }
      }
    }
  }
  &-actions {
    margin-top: calc(var(--s-basic-spacing) * 2);
  }
  .asset-logo {
    @include asset-logo-styles(48px);
  }
}
</style>
