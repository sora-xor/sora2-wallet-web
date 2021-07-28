<template>
  <wallet-base :title="t(`walletSend.${step === 1 ? 'title' : 'confirmTitle'}`)" show-back @back="handleBack">
    <div class="wallet-send">
      <template v-if="step === 1">
        <s-input
          class="wallet-send-address"
          :maxlength="128"
          :placeholder="t('walletSend.address')"
          v-model="address"
        />
        <p class="wallet-send-address-description">{{ t('walletSend.addressDesc') }}</p>
        <s-float-input
          v-model="amount"
          class="wallet-send-input"
          size="medium"
          has-locale-string
          :delimiters="delimiters"
          :max="getMax((asset || {}).address)"
        >
          <div class="wallet-send-amount" slot="top">
            <div class="wallet-send-amount-title">{{ t('walletSend.amount') }}</div>
            <div class="wallet-send-amount-balance">
              <span class="wallet-send-amount-balance-title">{{ t('walletSend.balance') }}</span>
              <span class="wallet-send-amount-balance-value">{{ balance }}</span>
              <formatted-amount v-if="assetFiatPrice" :value="getFiatBalance(asset)" is-fiat-value with-left-shift />
            </div>
          </div>
          <div class="asset s-flex" slot="right">
            <s-button v-if="isMaxButtonAvailable" class="asset-max s-typography-button--small" type="primary" alternative size="mini" border-radius="mini" @click="handleMaxClick">
              {{ t('walletSend.max') }}
            </s-button>
            <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
            <span class="asset-name">{{ asset.symbol }}</span>
          </div>
          <div class="asset-info" slot="bottom">
            <formatted-amount v-if="fiatAmount" :value="fiatAmount" is-fiat-value />
            <div class="asset-highlight">
              {{ asset.name || asset.symbol }}
              <s-tooltip :content="copyTooltip">
                <span class="asset-id" @click="handleCopyAddress(asset.address)">({{ getFormattedAddress(asset) }})</span>
              </s-tooltip>
            </div>
          </div>
        </s-float-input>
        <s-button class="wallet-send-action s-typography-button--large" type="primary" :disabled="sendButtonDisabled" :loading="feeLoading" @click="step = 2">
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
        </div>
        <s-button
          class="wallet-send-action s-typography-button--large"
          type="primary"
          :disabled="sendButtonDisabled"
          @click="handleSend"
        >
          {{ sendButtonDisabledText || t('walletSend.confirm') }}
        </s-button>
      </template>
      <wallet-fee :value="fee" has-fiat-value />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, Asset, FPNumber, CodecString, KnownAssets, KnownSymbols } from '@sora-substrate/util'

import TransactionMixin from './mixins/TransactionMixin'
import FormattedAmountMixin from './mixins/FormattedAmountMixin'
import CopyAddressMixin from './mixins/CopyAddressMixin'
import WalletBase from './WalletBase.vue'
import FormattedAmount from './FormattedAmount.vue'
import WalletFee from './WalletFee.vue'
import { RouteNames } from '../consts'
import { formatAddress, getAssetIconStyles } from '../util'
import { api } from '../api'

@Component({
  components: {
    WalletBase,
    FormattedAmount,
    WalletFee
  }
})
export default class WalletSend extends Mixins(TransactionMixin, FormattedAmountMixin, CopyAddressMixin) {
  readonly delimiters = FPNumber.DELIMITERS_CONFIG

  @Getter currentRouteParams!: any
  @Getter account!: any
  @Getter accountAssets!: Array<AccountAsset>

  @Action navigate
  @Action transfer

  step = 1
  address = ''
  amount = ''
  fee = this.getFPNumber(0)
  feeLoading = false

  async created (): Promise<void> {
    await this.calcFee()
  }

  get asset (): AccountAsset {
    const { address } = this.currentRouteParams.asset

    return this.accountAssets.find(asset => asset.address === address) || this.currentRouteParams.asset
  }

  get balance (): string {
    return this.formatCodecNumber(this.asset.balance.transferable, this.asset.decimals)
  }

  get assetFiatPrice (): CodecString | null {
    return this.getAssetFiatPrice(this.asset)
  }

  get xorAsset (): Asset {
    return KnownAssets.get(KnownSymbols.XOR)
  }

  get fiatAmount (): string | null {
    return this.getFiatAmountByString(this.amount, this.asset)
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
      return this.t(`walletSend.${this.emptyAmount ? 'enterAmount' : 'badAmount'}`, this.emptyAmount ? {} : { tokenSymbol: this.asset.symbol })
    }

    if (!this.hasEnoughXor) {
      return this.t('walletSend.badAmount', { tokenSymbol: KnownSymbols.XOR })
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

  async calcFee (): Promise<void> {
    this.feeLoading = true
    this.fee = this.getFPNumberFromCodec(
      await api.getTransferNetworkFee(
        this.asset.address,
        this.validAddress ? this.address : '',
        this.validAmount ? this.amount : 0
      )
    )
    this.feeLoading = false
  }

  getAssetIconStyles = getAssetIconStyles

  getFormattedAddress (asset: Asset): string {
    return formatAddress(asset.address, 10)
  }

  handleBack (): void {
    if (this.step !== 1) {
      this.step = 1
      return
    }
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleMaxClick (): Promise<void> {
    if (this.isXorAccountAsset(this.asset)) {
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
.wallet-send-input .el-input__inner {
  font-size: 20px;
  line-height: var(--s-line-height-small);
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
        margin-left: calc(var(--s-basic-spacing) / 2);
        letter-spacing: var(--s-letter-spacing-big);
      }
    }
    &-logo {
      @include asset-logo-styles(32px);
      width: $logo-size;
      height: $logo-size;
      margin: calc(var(--s-basic-spacing) / 2) var(--s-basic-spacing);
    }
    &-name {
      line-height: 2.29;
    }
    &-max {
      margin-left: var(--s-basic-spacing);
      height: var(--s-size-mini);
      padding: calc(var(--s-basic-spacing) / 2) var(--s-basic-spacing);
    }
    &-max, &-name {
      font-weight: 700;
    }
    &-info {
      display: flex;
      align-items: baseline;
      .asset-id {
        cursor: pointer;
      }
      .formatted-amount--fiat-value {
        font-weight: 600;
      }
    }
    &-highlight {
      margin-left: auto;
      color: var(--s-color-base-content-secondary);
      font-size: var(--s-font-size-extra-mini);
      font-weight: 300 ;
      line-height: var(--s-line-height-medium);
      letter-spacing: var(--s-letter-spacing-small);
      text-align: right;
    }
  }
  &-address {
    margin-bottom: var(--s-basic-spacing);
    &-description {
      margin-bottom: calc(var(--s-basic-spacing) * 2);
      padding-right: calc(var(--s-basic-spacing) * 1.25);
      padding-left: calc(var(--s-basic-spacing) * 1.25);
      font-weight: 300;
      font-size: var(--s-font-size-extra-small);
      line-height: var(--s-line-height-base);
    }
  }
  &-amount {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--s-basic-spacing);
    font-size: var(--s-font-size-mini);
    line-height: var(--s-line-height-medium);
    text-transform: uppercase;

    &-title,
    &-balance {
      display: inline-flex;
      align-items: baseline;

      &-title {
        margin-right: calc(var(--s-basic-spacing) / 2);
      }
    }
    &-balance {
      &-title {
        color: var(--s-color-base-content-secondary);
      }
    }
  }
  &-action {
    margin-top: calc(var(--s-basic-spacing) * 2);
    width: 100%;
  }
  .confirm {
    &-asset {
      margin-bottom: calc(var(--s-basic-spacing) * 2);
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
            margin: 0 var(--s-basic-spacing);
          }
          &-name {
            line-height: 1.33;
            font-weight: 400;
          }
        }
      }
    }
    &-from {
      margin-bottom: var(--s-basic-spacing);
    }
    &-to {
      margin-top: var(--s-basic-spacing);
      overflow-wrap: break-word;
    }
    &-from, &-to {
      // It's set to small size cuz we need to show full address
      font-size: var(--s-font-size-mini);
      font-weight: 600;
    }
  }
}
</style>
