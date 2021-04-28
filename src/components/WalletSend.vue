<template>
  <wallet-base :title="t(`walletSend.${step === 1 ? 'title' : 'confirmTitle'}`)" show-back @back="handleBack">
    <div class="wallet-send">
      <template v-if="step === 1">
        <s-input
          class="wallet-send-address"
          :maxlength="128"
          :placeholder="t('walletSend.address')"
          border-radius="mini"
          v-model="address"
          @change="calcFee"
        />
        <div class="wallet-send-amount">
          <div class="input-line">
            <div class="input-line-title">{{ t('walletSend.amount') }}</div>
            <div class="input-line-balance">
              <span class="asset-balance-title">{{ t('walletSend.balance') }}</span>
              <span class="asset-balance-value">{{ balance }}</span>
            </div>
          </div>
          <div class="input-line">
            <s-input placeholder="0.0" v-model="amount" v-float class="s-input--token-value" @change="calcFee" @blur="formatAmount" />
            <div class="asset s-flex">
              <s-button v-if="isMaxButtonAvailable" class="asset-max" type="tertiary" size="small" border-radius="mini" @click="handleMaxClick">
                {{ t('walletSend.max') }}
              </s-button>
              <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
        </div>
        <div class="wallet-send-fee s-flex">
          <span>{{ t('walletSend.fee') }}</span>
          <span class="wallet-send-fee_value">{{ fee.format() }} {{ KnownSymbols.XOR }}</span>
        </div>
        <s-button class="wallet-send-action" type="primary" :disabled="sendButtonDisabled" @click="step = 2">
          {{ sendButtonDisabledText || t('walletSend.title') }}
        </s-button>
      </template>
      <template v-else>
        <div class="confirm">
          <div class="confirm-asset s-flex">
            <span class="confirm-asset-title">{{ formatStringValue(amount, asset.decimals) }}</span>
            <div class="confirm-asset-value s-flex">
              <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
          <div class="confirm-from">{{ account.address }}</div>
          <s-icon name="arrows-arrow-bottom-24" />
          <div class="confirm-to">{{ address }}</div>
          <s-divider />
          <div class="wallet-send-fee s-flex">
            <span>{{ t('walletSend.fee') }}</span>
            <span class="wallet-send-fee_value">{{ fee.format() }} {{ KnownSymbols.XOR }}</span>
          </div>
        </div>
        <s-button
          class="wallet-send-action"
          type="primary"
          :disabled="sendButtonDisabled"
          @click="handleSend"
        >
          {{ sendButtonDisabledText || t('walletSend.confirm') }}
        </s-button>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, FPNumber, KnownAssets, KnownSymbols } from '@sora-substrate/util'

import TransactionMixin from './mixins/TransactionMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { delay, getAssetIconStyles } from '../util'
import { api } from '../api'

@Component({
  components: {
    WalletBase
  }
})
export default class WalletSend extends Mixins(TransactionMixin) {
  readonly KnownSymbols = KnownSymbols

  @Getter currentRouteParams!: any
  @Getter account!: any
  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate
  @Action transfer

  step = 1
  address = ''
  amount = ''
  fee = this.getFPNumber(0)

  async mounted (): Promise<void> {
    await this.calcFee()
  }

  get asset (): AccountAsset {
    const { address } = this.currentRouteParams.asset

    return this.accountAssets.find(asset => asset.address === address) || this.currentRouteParams.asset
  }

  get balance (): string {
    return this.formatCodecNumber(this.asset.balance.transferable, this.asset.decimals)
  }

  get emptyAddress (): boolean {
    if (!this.address.trim()) {
      return true
    }
    return false
  }

  get validAddress (): boolean {
    if (this.emptyAddress) {
      return false
    }
    return api.checkAddress(this.address) && this.account.address !== this.address
  }

  get emptyAmount (): boolean {
    return +this.amount === 0
  }

  get validAmount (): boolean {
    const amount = this.getFPNumber(this.amount, this.asset.decimals)
    const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, this.asset.decimals)
    return amount.isFinity() && !amount.isZero() && FPNumber.lte(amount, balance)
  }

  get isMaxButtonAvailable (): boolean {
    const decimals = this.asset.decimals
    const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, decimals)
    const amount = this.getFPNumber(this.amount, decimals)
    if (this.isXorAccountAsset(this.asset)) {
      if (this.fee.isZero()) {
        return false
      }
      return !FPNumber.eq(this.fee, balance.sub(amount)) && FPNumber.gt(balance, this.fee)
    }
    return !FPNumber.eq(balance, amount)
  }

  get hasEnoughXor (): boolean {
    return api.hasEnoughXor(this.asset, this.amount, this.fee)
  }

  get sendButtonDisabled (): boolean {
    return this.loading || !this.validAddress || !this.validAmount || !this.hasEnoughXor
  }

  get sendButtonDisabledText (): string {
    if (!this.validAddress) {
      return this.t(`walletSend.${this.emptyAddress ? 'enterAddress' : 'badAddress'}`)
    }

    if (!this.validAmount) {
      return this.t(`walletSend.${this.emptyAmount ? 'enterAmount' : 'badAmount'}`, this.emptyAmount ? {} : { symbol: this.asset.symbol })
    }

    if (!this.hasEnoughXor) {
      return this.t('walletSend.badAmount', { symbol: KnownSymbols.XOR })
    }

    return ''
  }

  isXorAccountAsset (asset: AccountAsset): boolean {
    const knownAsset = KnownAssets.get(asset.address)
    if (!knownAsset) {
      return false
    }
    return knownAsset.symbol === KnownSymbols.XOR
  }

  // We could use this method to check if the user enters a text value in a numeric field (we could do this by copy and paste)
  isNumberValue (value: any): boolean {
    const numberValue = +value
    return typeof numberValue === 'number' && !isNaN(numberValue)
  }

  resetAmount (): void {
    this.amount = ''
  }

  async calcFee (): Promise<void> {
    if (this.amount.indexOf('.') === 0) {
      this.amount = '0' + this.amount
    }
    if (!this.isNumberValue(this.amount)) {
      await delay()
      this.resetAmount()
      return
    }
    this.fee = this.getFPNumberFromCodec(
      await api.getTransferNetworkFee(
        this.asset.address,
        this.validAddress ? this.address : '',
        this.validAmount ? this.amount : 0
      )
    )
  }

  formatAmount (): void {
    if (+this.amount === 0) {
      this.resetAmount()
      return
    }
    // Trim zeros in the beginning
    if (this.amount.indexOf('0') === 0 && this.amount.indexOf('.') !== 1) {
      this.amount = this.amount.replace(/^0+/, '')
    }
    // Trim dot in the end
    if (this.amount.indexOf('.') === this.amount.length - 1) {
      this.amount = this.amount.substring(0, this.amount.length - 1)
    }
  }

  getAssetIconStyles = getAssetIconStyles

  handleBack (): void {
    if (this.step !== 1) {
      this.step = 1
      return
    }
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleMaxClick (): Promise<void> {
    if (this.isXorAccountAsset(this.asset)) {
      await this.calcFee()
      const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, this.asset.decimals)
      this.amount = balance.sub(this.fee).toString()
      return
    }
    this.amount = this.getStringFromCodec(this.asset.balance.transferable, this.asset.decimals)
  }

  async handleSend (): Promise<void> {
    await this.withNotifications(
      async () => {
        if (!this.hasEnoughXor) {
          throw new Error('walletSend.badAmount')
        }
        await this.transfer({ to: this.address, amount: this.amount })
      }
    )
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style lang="scss">
.wallet-send {
  $swap-input-class: ".el-input";
  .s-input--token-value {
    min-height: 0;
    font-feature-settings: var(--s-font-feature-settings-input);
    #{$swap-input-class} {
      #{$swap-input-class}__inner {
        padding-top: 0;
      }
    }
    #{$swap-input-class}__inner {
      height: var(--s-size-small);
      padding-right: 0;
      padding-left: 0;
      border-radius: 0;
      color: var(--s-color-base-content-primary);
      font-size: 20px;
      line-height: var(--s-line-height-small);
      &, &:hover, &:focus {
        background-color: var(--s-color-base-background);
        border-color: var(--s-color-base-background);
      }
      &:disabled {
        color: var(--s-color-base-content-tertiary);
      }
      &:not(:disabled) {
        &:hover, &:focus {
          color: var(--s-color-base-content-primary);
        }
      }
    }
    .s-placeholder {
      display: none;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';
$logo-size: var(--s-size-mini);
// TODO: fix typography issues here
.wallet-send {
  .asset {
    align-items: center;
    &-balance {
      margin-left: auto;
      &-title {
        color: var(--s-color-base-content-tertiary);
        font-size: var(--s-font-size-mini);
      }
      &-value {
        margin-left: $basic-spacing_mini / 2;
        font-feature-settings: var(--s-font-feature-settings-common);
        letter-spacing: var(--s-letter-spacing-big);
      }
    }
    &-logo {
      @include asset-logo-styles;
      width: $logo-size;
      height: $logo-size;
      margin: $basic-spacing_mini / 2 $basic-spacing_mini;
    }
    &-name {
      line-height: 2.29;
      margin-right: $basic-spacing_mini;
    }
    &-max {
      margin-left: $basic-spacing_mini;
      height: var(--s-size-mini);
      padding: $basic-spacing_mini / 2 $basic-spacing_mini;
    }
    &-max, &-name {
      font-feature-settings: var(--s-font-feature-settings-heading);
      font-weight: 700;
    }
  }
  &-address {
    margin-bottom: $basic-spacing;
  }
  &-amount {
    position: relative;
    padding: $basic-spacing_small $basic-spacing_mini $basic-spacing_mini $basic-spacing;
    width: 100%;
    background-color: var(--s-color-base-background);
    border-radius: var(--s-border-radius-mini);
    .input-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      + .input-line {
        margin-top: $basic-spacing_small;
      }
      &-title,
      &-balance {
        display: inline-flex;
        align-items: baseline;
      }
      &-title {
        font-weight: 600;
      }
      &-balance {
        padding-right: $basic-spacing_mini;
      }
    }
  }
  &-fee {
    align-items: center;
    margin-top: $basic-spacing_mini;
    width: 100%;
    padding-right: $basic-spacing_mini;
    padding-left: $basic-spacing_mini;
    color: var(--s-color-base-content-secondary);
    &_value {
      margin-left: auto;
      font-feature-settings: var(--s-font-feature-settings-common);
    }
  }
  &-action {
    margin-top: $basic-spacing;
    width: 100%;
  }
  .confirm {
    &-asset {
      margin-bottom: $basic-spacing;
      font-size: 30px;
      font-weight: 400;
      &-title {
        line-height: 1.33;
        flex: 1;
        word-break: break-word;
      }
      &-value {
        .asset {
          &-logo {
            $logo-size: 40px;
            width: $logo-size;
            height: $logo-size;
            margin: 0 $basic-spacing_mini;
          }
          &-name {
            line-height: 1.33;
            font-weight: 400;
          }
        }
      }
    }
    &-from {
      margin-bottom: $basic-spacing_mini;
    }
    &-to {
      margin-top: $basic-spacing_mini;
      overflow-wrap: break-word;
    }
    &-from, &-to {
      // It's set to small size cuz we need to show full address
      font-size: $font-size_small;
      font-weight: 600;
    }
  }
}
</style>
