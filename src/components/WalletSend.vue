<template>
  <wallet-base
    :title="t(`walletSend.${step === 1 ? 'title' : 'confirmTitle'}`)"
    :tooltip="tooltipContent"
    show-back
    :showHeader="showAdditionalInfo"
    @back="handleBack"
  >
    <div class="wallet-send">
      <template v-if="step === 1">
        <s-input
          class="wallet-send-address"
          :maxlength="128"
          :placeholder="t('walletSend.address')"
          v-model="address"
        />
        <template v-if="validAddress && isNotSoraAddress">
          <p class="wallet-send-address-warning">{{ t('walletSend.addressWarning') }}</p>
          <s-tooltip :content="copyTooltip">
            <p class="wallet-send-address-formatted" @click="handleCopyAddress(formattedSoraAddress)">
              {{ formattedSoraAddress }}
            </p>
          </s-tooltip>
        </template>
        <p v-if="isAccountAddress" class="wallet-send-address-error">{{ t('walletSend.addressError') }}</p>
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
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                fiat-format-as-value
                with-left-shift
                value-class="wallet-send-amount-balance-value"
                :value="balance"
                :asset-symbol="asset.symbol"
                :fiat-value="getFiatBalance(asset)"
              />
            </div>
          </div>
          <div class="asset s-flex" slot="right">
            <s-button
              v-if="isMaxButtonAvailable"
              class="asset-max s-typography-button--small"
              type="primary"
              alternative
              size="mini"
              border-radius="mini"
              @click="handleMaxClick"
            >
              {{ t('walletSend.max') }}
            </s-button>
            <div class="asset-box">
              <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
          <div class="asset-info" slot="bottom">
            <formatted-amount v-if="fiatAmount" :value="fiatAmount" is-fiat-value />
            <div class="asset-highlight">
              {{ asset.name || asset.symbol }}
              <s-tooltip :content="copyTooltip">
                <span class="asset-id" @click="handleCopyAddress(asset.address)">
                  ({{ getFormattedAddress(asset) }})
                </span>
              </s-tooltip>
            </div>
          </div>
        </s-float-input>
        <s-button
          class="wallet-send-action s-typography-button--large"
          type="primary"
          :disabled="sendButtonDisabled"
          @click="handleSend"
        >
          {{ sendButtonDisabledText || t('walletSend.title') }}
        </s-button>
      </template>
      <template v-else-if="step === 2">
        <network-fee-warning :fee="formattedFee" @confirm="confirmNextTxFailure" />
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
          <div class="confirm-to">{{ formattedSoraAddress }}</div>
        </div>
        <s-button
          class="wallet-send-action s-typography-button--large"
          type="primary"
          :disabled="sendButtonDisabled"
          @click="handleConfirm"
        >
          {{ sendButtonDisabledText || t('walletSend.confirm') }}
        </s-button>
      </template>
      <wallet-fee v-if="showAdditionalInfo" :value="fee" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import {
  AccountAsset,
  Asset,
  FPNumber,
  CodecString,
  KnownAssets,
  KnownSymbols,
  Operation,
  XOR,
} from '@sora-substrate/util';

import TransactionMixin from './mixins/TransactionMixin';
import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import { RouteNames } from '../consts';
import { formatAddress, formatSoraAddress, getAssetIconStyles } from '../util';
import { api } from '../api';

import WalletBase from './WalletBase.vue';
import FormattedAmount from './FormattedAmount.vue';
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue';
import NetworkFeeWarning from './NetworkFeeWarning.vue';
import WalletFee from './WalletFee.vue';

@Component({
  components: {
    WalletBase,
    FormattedAmount,
    FormattedAmountWithFiatValue,
    NetworkFeeWarning,
    WalletFee,
  },
})
export default class WalletSend extends Mixins(
  TransactionMixin,
  FormattedAmountMixin,
  CopyAddressMixin,
  NetworkFeeWarningMixin
) {
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  @Getter currentRouteParams!: any;
  @Getter accountAssets!: Array<AccountAsset>;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action transfer!: (options: { to: string; amount: string }) => Promise<void>;

  step = 1;
  address = '';
  amount = '';
  showWarningFeeNotification = false;
  showAdditionalInfo = true;

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.Transfer);
  }

  get formattedFee(): string {
    return this.fee.toLocaleString();
  }

  get tooltipContent(): string {
    return this.step === 1 ? this.t('walletSend.tooltip') : '';
  }

  get asset(): AccountAsset {
    const { address } = this.currentRouteParams.asset;

    return this.accountAssets.find((asset) => asset.address === address) || this.currentRouteParams.asset;
  }

  get balance(): string {
    return this.formatCodecNumber(this.asset.balance.transferable, this.asset.decimals);
  }

  get assetFiatPrice(): Nullable<CodecString> {
    return this.getAssetFiatPrice(this.asset);
  }

  get fiatAmount(): Nullable<string> {
    return this.getFiatAmountByString(this.amount, this.asset);
  }

  get emptyAddress(): boolean {
    if (!this.address.trim()) {
      return true;
    }
    return false;
  }

  get isAccountAddress(): boolean {
    return [this.address, this.formattedSoraAddress].includes(this.account.address);
  }

  get validAddress(): boolean {
    if (this.emptyAddress) {
      return false;
    }
    return api.validateAddress(this.address) && !this.isAccountAddress;
  }

  get formattedSoraAddress(): string {
    if (this.emptyAddress) {
      return '';
    }
    try {
      return formatSoraAddress(this.address);
    } catch {
      return '';
    }
  }

  get isNotSoraAddress(): boolean {
    return !!this.formattedSoraAddress && this.address.slice(0, 2) !== 'cn';
  }

  get emptyAmount(): boolean {
    return +this.amount === 0;
  }

  get validAmount(): boolean {
    const amount = this.getFPNumber(this.amount, this.asset.decimals);
    const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, this.asset.decimals);
    return amount.isFinity() && !amount.isZero() && FPNumber.lte(amount, balance);
  }

  get isMaxButtonAvailable(): boolean {
    const decimals = this.asset.decimals;
    const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, decimals);
    const amount = this.getFPNumber(this.amount, decimals);
    if (this.isXorAccountAsset(this.asset)) {
      if (this.fee.isZero()) {
        return false;
      }
      return !FPNumber.eq(this.fee, balance.sub(amount)) && FPNumber.gt(balance, this.fee);
    }
    return !FPNumber.eq(balance, amount);
  }

  get hasEnoughXor(): boolean {
    return api.hasEnoughXor(this.asset, this.amount, this.fee);
  }

  get sendButtonDisabled(): boolean {
    return this.loading || !this.validAddress || !this.validAmount || !this.hasEnoughXor;
  }

  get sendButtonDisabledText(): string {
    if (!this.validAddress) {
      return this.t(`walletSend.${this.emptyAddress ? 'enterAddress' : 'badAddress'}`);
    }

    if (!this.validAmount) {
      return this.t(
        `walletSend.${this.emptyAmount ? 'enterAmount' : 'badAmount'}`,
        this.emptyAmount ? {} : { tokenSymbol: this.asset.symbol }
      );
    }

    if (!this.hasEnoughXor) {
      return this.t('walletSend.badAmount', { tokenSymbol: KnownSymbols.XOR });
    }

    return '';
  }

  get xorBalance(): Nullable<CodecString> {
    // TODO: XOR balance here can be unsyncronized, need to fix
    const accountXor = api.accountAssets.find((asset) => asset.address === XOR.address);
    return accountXor ? accountXor.balance.transferable : null;
  }

  isXorAccountAsset(asset: AccountAsset): boolean {
    const knownAsset = KnownAssets.get(asset.address);
    if (!knownAsset) {
      return false;
    }
    return knownAsset.symbol === KnownSymbols.XOR;
  }

  getAssetIconStyles = getAssetIconStyles;

  getFormattedAddress(asset: AccountAsset): string {
    return formatAddress(asset.address, 10);
  }

  handleBack(): void {
    if (this.step !== 1) {
      this.showAdditionalInfo = true;
      this.step = 1;
      return;
    }
    this.navigate({ name: RouteNames.Wallet });
  }

  async handleMaxClick(): Promise<void> {
    if (this.isXorAccountAsset(this.asset)) {
      const balance = this.getFPNumberFromCodec(this.asset.balance.transferable, this.asset.decimals);
      this.amount = balance.sub(this.fee).toString();
      return;
    }
    this.amount = this.getStringFromCodec(this.asset.balance.transferable, this.asset.decimals);
  }

  async handleSend(): Promise<void> {
    if (
      !this.isXorSufficientForNextTx({
        type: Operation.Transfer,
        isXorAccountAsset: this.isXorAccountAsset(this.asset),
        xorBalance: this.xorBalance ? this.getFPNumberFromCodec(this.xorBalance) : this.Zero,
        amount: this.getFPNumber(this.amount),
      })
    ) {
      this.showAdditionalInfo = false;
      this.step = 2;
      return;
    }
    this.step = 3;
  }

  async handleConfirm(): Promise<void> {
    await this.withNotifications(async () => {
      if (!this.hasEnoughXor) {
        throw new Error('walletSend.badAmount');
      }
      await this.transfer({ to: this.address, amount: this.amount });
    });
    this.navigate({ name: RouteNames.Wallet });
  }

  confirmNextTxFailure(): void {
    this.showAdditionalInfo = true;
    this.step = 3;
  }
}
</script>

<style lang="scss">
.wallet-send {
  &-amount-balance {
    .formatted-amount--fiat-value {
      text-align: right;
    }
  }
  &-input .el-input__inner {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: var(--s-font-size-large);
    line-height: var(--s-line-height-small);
    font-weight: 800;
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

    & > * {
      margin-left: var(--s-basic-spacing);
    }

    &-balance {
      margin-left: auto;
      &-title {
        color: var(--s-color-base-content-tertiary);
        font-size: var(--s-font-size-mini);
      }
      &-value {
        margin-left: $basic-spacing-mini;
        letter-spacing: var(--s-letter-spacing-big);
      }
    }
    &-box {
      display: flex;
      align-items: center;
      background-color: var(--s-color-utility-surface);
      border-radius: var(--s-border-radius-mini);
      box-shadow: var(--s-shadow-element);
      padding: $basic-spacing-mini #{$basic-spacing-extra-small};
    }
    &-logo {
      @include asset-logo-styles(var(--s-size-mini));
      margin-right: var(--s-basic-spacing);
    }
    &-max {
      height: var(--s-size-mini);
      padding: $basic-spacing-mini var(--s-basic-spacing);
    }
    &-max,
    &-name {
      font-weight: 800;
    }
    &-name {
      font-size: var(--s-icon-font-size-small);
      line-height: var(--s-line-height-reset);
    }
    &-info {
      display: flex;
      align-items: baseline;
      .formatted-amount--fiat-value {
        margin-right: $basic-spacing-mini;
        font-weight: 600;
      }
    }
    &-highlight {
      margin-left: auto;
      color: var(--s-color-base-content-secondary);
      font-size: var(--s-font-size-extra-mini);
      font-weight: 300;
      line-height: var(--s-line-height-medium);
      letter-spacing: var(--s-letter-spacing-small);
      text-align: right;
    }
  }
  .asset-id,
  &-address-formatted {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &-address-formatted,
  .confirm-from,
  .confirm-to {
    word-break: break-all;
  }
  &-address {
    margin-bottom: var(--s-basic-spacing);
    &-description {
      margin-bottom: #{$basic-spacing-medium};
    }
    &-warning,
    &-error,
    &-formatted {
      padding-right: calc(var(--s-basic-spacing) * 1.25);
      padding-left: calc(var(--s-basic-spacing) * 1.25);
    }
    &-warning,
    &-error {
      margin-bottom: var(--s-basic-spacing);
      font-weight: 400;
      font-size: var(--s-font-size-extra-small);
      line-height: var(--s-line-height-base);
    }
    &-warning {
      color: var(--s-color-status-warning);
    }
    &-error {
      color: var(--s-color-status-error);
    }
    &-formatted {
      margin-bottom: calc(var(--s-basic-spacing) * 2);
      font-weight: 200;
      font-size: var(--s-font-size-mini);
      line-height: var(--s-line-height-base);
      letter-spacing: var(--s-letter-spacing-small);
    }
  }
  &-amount {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: var(--s-basic-spacing);
    font-size: var(--s-font-size-mini);
    font-weight: 300;
    line-height: var(--s-line-height-medium);
    text-transform: uppercase;

    &-title,
    &-balance {
      display: inline-flex;
      align-items: baseline;

      &-title {
        margin-right: $basic-spacing-mini;
      }
    }
    &-balance {
      flex-wrap: wrap;
      justify-content: flex-end;
      margin-left: var(--s-basic-spacing);
      &-title {
        color: var(--s-color-base-content-secondary);
      }
    }
  }
  &-action {
    margin-top: #{$basic-spacing-medium};
    width: 100%;
  }
  .confirm {
    &-asset {
      margin-bottom: #{$basic-spacing-medium};
      font-size: var(--s-heading2-font-size);
      line-height: var(--s-line-height-small);
      font-weight: 800;
      &-title {
        line-height: 1.33;
        flex: 1;
        word-break: break-word;
      }
      &-value {
        align-items: center;
        justify-content: flex-end;
        white-space: nowrap;
        .asset {
          &-logo {
            @include asset-logo-styles(var(--s-size-small));
            margin-right: calc(var(--s-basic-spacing) * 2);
          }
          &-name {
            font-size: var(--s-heading2-font-size);
            line-height: var(--s-line-height-small);
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
    &-from,
    &-to {
      // It's set to small size cuz we need to show full address
      font-size: var(--s-font-size-mini);
      font-weight: 600;
    }
  }
}
</style>
