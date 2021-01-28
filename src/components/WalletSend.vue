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
              <span class="asset-balance-value">{{ asset.balance }}</span>
            </div>
          </div>
          <div class="input-line">
            <s-input placeholder="0.0" v-model="amount" v-float class="s-input--token-value" @change="calcFee" @blur="formatAmount" />
            <div class="asset s-flex">
              <s-button v-if="isMaxButtonAvailable" class="asset-max" type="tertiary" size="small" border-radius="mini" @click="handleMaxClick">
                {{ t('walletSend.max') }}
              </s-button>
              <i :class="getAssetClasses(asset.symbol)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
        </div>
        <!-- TODO: It seems that we don't need next two checks -->
        <div v-if="validAddress && validAmount" class="wallet-send-fee s-flex">
          <span>{{ t('walletSend.fee') }}</span>
          <span class="wallet-send-fee_value">{{ fee }} {{ KnownSymbols.XOR }}</span>
        </div>
        <s-button class="wallet-send-action" type="primary" :disabled="!validAddress || !validAmount || !hasEnoughXor" @click="step = 2">
          <template v-if="!validAddress">
            {{ t(`walletSend.${emptyAddress ? 'enterAddress' : 'badAddress'}`) }}
          </template>
          <template v-else-if="!validAmount">
            {{ t(`walletSend.${emptyAmount ? 'enterAmount' : 'badAmount'}`, emptyAmount ? {} : { symbol: asset.symbol }) }}
          </template>
          <template v-else-if="!hasEnoughXor">
            {{ t('walletSend.badAmount', { symbol: KnownSymbols.XOR }) }}
          </template>
          <template v-else>
            {{ t('walletSend.title') }}
          </template>
        </s-button>
      </template>
      <template v-else>
        <div class="confirm">
          <div class="confirm-asset s-flex">
            <span class="confirm-asset-title">{{ amount }}</span>
            <div class="confirm-asset-value s-flex">
              <i :class="getAssetClasses(asset.symbol)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
          <div class="confirm-from">{{ account.address }}</div>
          <s-icon name="arrow-bottom-rounded" />
          <div class="confirm-to">{{ address }}</div>
          <s-divider />
          <div class="wallet-send-fee s-flex">
            <span>{{ t('walletSend.fee') }}</span>
            <span class="wallet-send-fee_value">{{ fee }} {{ KnownSymbols.XOR }}</span>
          </div>
        </div>
        <s-button class="wallet-send-action" type="primary" @click="handleSend">
          {{ t('walletSend.confirm') }}
        </s-button>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, FPNumber, KnownAssets, KnownSymbols } from '@sora-substrate/util'

import TransactionMixin from './mixins/TransactionMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'
import { delay, getAssetIconClasses } from '../util'
import { dexApi } from '../api'

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
  fee = '0'

  async mounted (): Promise<void> {
    await this.calcFee()
  }

  beforeDestroy (): void {
    this.fee = '0'
  }

  get asset (): AccountAsset {
    return this.currentRouteParams.asset
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
    return dexApi.checkAddress(this.address) && this.account.address !== this.address
  }

  get emptyAmount (): boolean {
    return new FPNumber(this.amount, this.asset.decimals).isZero()
  }

  get validAmount (): boolean {
    const amount = new FPNumber(this.amount, this.asset.decimals)
    const balance = new FPNumber(this.asset.balance, this.asset.decimals)
    return amount.isFinity() && !amount.isZero() && (FPNumber.lt(amount, balance) || FPNumber.eq(amount, balance))
  }

  get isMaxButtonAvailable (): boolean {
    const decimals = this.asset.decimals
    const balance = new FPNumber(this.asset.balance, decimals)
    const amount = new FPNumber(this.amount, decimals)
    if (this.isXorAccountAsset(this.asset)) {
      if (+this.fee === 0) {
        return false
      }
      const fee = new FPNumber(this.fee, decimals)
      return !FPNumber.eq(fee, balance.sub(amount)) && FPNumber.lt(fee, balance.sub(amount))
    }
    return !FPNumber.eq(balance, amount)
  }

  get hasEnoughXor (): boolean {
    const xor = KnownAssets.get(KnownSymbols.XOR)
    const xorDecimals = xor.decimals
    const fee = new FPNumber(this.fee, xorDecimals)
    if (this.isXorAccountAsset(this.asset)) {
      const balance = new FPNumber(this.asset.balance, xorDecimals)
      const amount = new FPNumber(this.amount, xorDecimals)
      return FPNumber.lt(fee, balance.sub(amount)) || FPNumber.eq(fee, balance.sub(amount))
    }
    const accountXor = this.accountAssets.find(item => this.isXorAccountAsset(item))
    if (!accountXor) {
      return false
    }
    const balance = new FPNumber(accountXor.balance, xorDecimals)
    return FPNumber.lt(fee, balance) || FPNumber.eq(fee, balance)
  }

  isXorAccountAsset (asset: AccountAsset): boolean {
    return asset.symbol === KnownSymbols.XOR
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
    this.fee = await dexApi.getTransferNetworkFee(
      this.asset.address,
      this.validAddress ? this.address : '',
      this.validAmount ? this.amount : 0
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

  getAssetClasses = getAssetIconClasses

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
      const balance = new FPNumber(this.asset.balance, this.asset.decimals)
      const fee = new FPNumber(this.fee, this.asset.decimals)
      this.amount = balance.sub(fee).toString()
      return
    }
    this.amount = this.asset.balance
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
    font-feature-settings: $s-font-feature-settings-input;
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
      line-height: 1.3;
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
        font-feature-settings: $s-font-feature-settings-common;
        letter-spacing: $s-letter-spacing-big;
      }
    }
    &-logo {
      @include asset-logo-styles;
      $logo-size: 24px;
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
      font-feature-settings: $s-font-feature-settings-title;
      @include font-weight(700, true);
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
        @include font-weight(600);
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
      font-feature-settings: $s-font-feature-settings-common;
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
      @include font-weight(400);
      &-title {
        line-height: 1.33;
        flex: 1;
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
            @include font-weight(400, true);
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
      @include font-weight(600);
    }
  }
}
</style>
