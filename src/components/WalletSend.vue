<template>
  <wallet-base
    show-back
    :reset-focus="step.toString()"
    :title="t(`walletSend.${step === 1 ? 'title' : 'confirmTitle'}`)"
    :tooltip="tooltipContent"
    :showHeader="showAdditionalInfo"
    @back="handleBack"
  >
    <div class="wallet-send">
      <template v-if="step === 1">
        <address-book-input class="wallet-send-address" exclude-connected v-model="address" :is-valid="validAddress" />

        <template v-if="validAddress && isNotSoraAddress">
          <p class="wallet-send-address-warning">{{ t('walletSend.addressWarning') }}</p>
          <s-tooltip :content="copyValueAssetId" placement="top">
            <p class="wallet-send-address-formatted" @click="handleCopyAddress(formattedSoraAddress, $event)">
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
          :decimals="asset.decimals"
          :max="MaxInputNumber"
        >
          <div class="wallet-send-amount" slot="top">
            <div class="wallet-send-amount-title">{{ t('amountText') }}</div>
            <div class="wallet-send-amount-balance">
              <span class="wallet-send-amount-balance-title">{{ t('walletSend.balance') }}</span>
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                fiat-format-as-value
                with-left-shift
                value-class="wallet-send-amount-balance-value"
                :value="formattedBalance"
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
              <div class="asset-box__logo">
                <token-logo :token="asset" size="small" />
              </div>
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>
          <div class="asset-info" slot="bottom">
            <formatted-amount v-if="fiatAmount" :value="fiatAmount" is-fiat-value />
          </div>
        </s-float-input>
        <s-button
          class="wallet-send-action s-typography-button--large"
          type="primary"
          :disabled="sendButtonDisabled"
          :loading="loading"
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
              <div class="confirm-asset-icon">
                <token-logo :token="asset" />
              </div>
              <span class="asset-name">{{ asset.symbol }}</span>
            </div>
          </div>

          <div class="confirm-address">
            <span>{{ account.address }}</span>
            <s-icon name="arrows-arrow-bottom-24" />
            <span>{{ formattedSoraAddress }}</span>
          </div>

          <account-confirmation-option with-hint />
        </div>

        <s-button
          class="wallet-send-action s-typography-button--large"
          type="primary"
          :disabled="sendButtonDisabled"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ sendButtonDisabledText || t('confirmText') }}
        </s-button>
      </template>

      <wallet-fee v-if="showAdditionalInfo" :value="fee" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { FPNumber, Operation } from '@sora-substrate/sdk';
import { XOR } from '@sora-substrate/sdk/build/assets/consts';
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../api';
import { RouteNames } from '../consts';
import { state, mutation, action } from '../store/decorators';
import { validateAddress, formatAddress, formatAccountAddress } from '../util';

import AccountConfirmationOption from './Account/Settings/ConfirmationOption.vue';
import AddressBookInput from './AddressBook/Input.vue';
import FormattedAmount from './FormattedAmount.vue';
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import NetworkFeeWarningMixin from './mixins/NetworkFeeWarningMixin';
import TransactionMixin from './mixins/TransactionMixin';
import NetworkFeeWarning from './NetworkFeeWarning.vue';
import TokenLogo from './TokenLogo.vue';
import WalletBase from './WalletBase.vue';
import WalletFee from './WalletFee.vue';

import type { Route } from '../store/router/types';
import type { CodecString } from '@sora-substrate/sdk';
import type { AccountAsset, AccountBalance } from '@sora-substrate/sdk/build/assets/types';
import type { Subscription } from 'rxjs';

@Component({
  components: {
    WalletBase,
    FormattedAmount,
    FormattedAmountWithFiatValue,
    NetworkFeeWarning,
    WalletFee,
    TokenLogo,
    AddressBookInput,
    AccountConfirmationOption,
  },
})
export default class WalletSend extends Mixins(
  TransactionMixin,
  FormattedAmountMixin,
  CopyAddressMixin,
  NetworkFeeWarningMixin
) {
  readonly delimiters = FPNumber.DELIMITERS_CONFIG;

  @state.router.previousRoute private previousRoute!: RouteNames;
  @state.router.previousRouteParams private previousRouteParams!: Record<string, unknown>;
  @state.router.currentRouteParams private currentRouteParams!: Record<string, AccountAsset | string>;
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @state.transactions.isConfirmTxDialogDisabled private isConfirmTxDisabled!: boolean;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @action.account.transfer private transfer!: (options: { to: string; amount: string }) => Promise<void>;

  step = 1;
  address = '';
  amount = '';
  showAdditionalInfo = true;
  private assetBalance: Nullable<AccountBalance> = null;
  private assetBalanceSubscription: Nullable<Subscription> = null;

  created(): void {
    if (!this.currentRouteParams.asset) {
      this.handleBack();
      return;
    }

    if (this.currentRouteParams.address) {
      this.address = this.currentRouteParams.address as string;
    }

    if (!this.accountAsset) {
      this.resetAssetBalanceSubscription();
      this.assetBalanceSubscription = api.assets.getAssetBalanceObservable(this.assetParams).subscribe((balance) => {
        this.assetBalance = balance;
      });
    }
  }

  beforeDestroy(): void {
    this.resetAssetBalanceSubscription();
  }

  get assetParams(): AccountAsset {
    return this.currentRouteParams.asset as AccountAsset;
  }

  get accountAsset(): Nullable<AccountAsset> {
    return this.accountAssets.find((accountAsset) => accountAsset.address === this.assetParams.address);
  }

  get asset(): AccountAsset {
    if (this.accountAsset) return this.accountAsset;

    return {
      ...this.assetParams,
      balance: this.assetBalance as AccountBalance,
    };
  }

  get fee(): FPNumber {
    return this.getFPNumberFromCodec(this.networkFees.Transfer);
  }

  get formattedFee(): string {
    return this.fee.toLocaleString();
  }

  get tooltipContent(): string {
    return this.step === 1 ? this.t('walletSend.tooltip') : '';
  }

  get copyValueAssetId(): string {
    return this.copyTooltip(this.t('assets.assetId'));
  }

  get transferableBalance(): CodecString {
    return this.asset.balance ? this.asset.balance.transferable : '0';
  }

  get formattedBalance(): string {
    return this.formatCodecNumber(this.transferableBalance, this.asset.decimals);
  }

  get assetFiatPrice(): Nullable<CodecString> {
    return this.getAssetFiatPrice(this.asset);
  }

  get fiatAmount(): Nullable<string> {
    return this.getFiatAmountByString(this.amount, this.asset);
  }

  get emptyAddress(): boolean {
    return !this.address.trim();
  }

  get isAccountAddress(): boolean {
    return [this.address, this.formattedSoraAddress].includes(this.account.address);
  }

  get formattedSoraAddress(): string {
    return formatAccountAddress(this.address);
  }

  get validAddress(): boolean {
    return validateAddress(this.address);
  }

  get isNotSoraAddress(): boolean {
    return !!this.formattedSoraAddress && !this.address.startsWith('cn');
  }

  get emptyAmount(): boolean {
    return +this.amount === 0;
  }

  get validAmount(): boolean {
    const amount = this.getFPNumber(this.amount, this.asset.decimals);
    const balance = this.getFPNumberFromCodec(this.transferableBalance, this.asset.decimals);
    return amount.isFinity() && !amount.isZero() && FPNumber.lte(amount, balance);
  }

  get isMaxButtonAvailable(): boolean {
    if (this.shouldBalanceBeHidden) {
      return false; // MAX button behavior discloses hidden balance so it should be hidden in ANY case
    }

    const decimals = this.asset.decimals;
    const balance = this.getFPNumberFromCodec(this.transferableBalance, decimals);
    const amount = this.getFPNumber(this.amount, decimals);

    if (this.isXorAccountAsset) {
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
      return this.emptyAmount
        ? this.t('walletSend.enterAmount')
        : this.t('insufficientBalanceText', { tokenSymbol: this.asset.symbol });
    }

    if (!this.hasEnoughXor) {
      return this.t('insufficientBalanceText', { tokenSymbol: XOR.symbol });
    }

    return '';
  }

  get isXorAccountAsset(): boolean {
    return this.asset.address === XOR.address;
  }

  getFormattedAddress(asset: AccountAsset): string {
    return formatAddress(asset.address, 10);
  }

  handleBack(): void {
    if (this.step !== 1) {
      this.showAdditionalInfo = true;
      this.step = 1;
      return;
    }
    this.navigate({
      name: this.previousRoute,
      params: this.previousRouteParams,
    });
  }

  async handleMaxClick(): Promise<void> {
    if (this.isXorAccountAsset) {
      const balance = this.getFPNumberFromCodec(this.transferableBalance, this.asset.decimals);
      this.amount = balance.sub(this.fee).toString();
      return;
    }
    this.amount = this.getStringFromCodec(this.transferableBalance, this.asset.decimals);
  }

  async handleSend(): Promise<void> {
    if (
      this.allowFeePopup &&
      !this.isXorSufficientForNextTx({
        type: Operation.Transfer,
        isXor: this.isXorAccountAsset,
        amount: this.getFPNumber(this.amount),
      })
    ) {
      this.showAdditionalInfo = false;
      this.step = 2;
      return;
    }

    if (this.isConfirmTxDisabled) {
      await this.handleConfirm();
    } else {
      this.step = 3;
    }
  }

  async handleConfirm(): Promise<void> {
    await this.withNotifications(async () => {
      if (!this.hasEnoughXor) throw new Error('walletSend.insufficientBalanceText');
      await this.transfer({ to: this.address, amount: this.amount });
      this.navigate({ name: RouteNames.Wallet });
    });
  }

  confirmNextTxFailure(): void {
    this.showAdditionalInfo = true;
    this.step = 3;
  }

  private resetAssetBalanceSubscription(): void {
    if (this.assetBalanceSubscription) {
      this.assetBalanceSubscription.unsubscribe();
    }
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
$logo-size: var(--s-size-mini);
$telegram-web-app-width: 500px;
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
      padding: $basic-spacing-mini #{$basic-spacing-tiny};
      &__logo {
        @include asset-logo-styles;
        margin-right: var(--s-basic-spacing) !important;
      }
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

  &__new-address {
    background: rgba(248, 8, 123, 0.09);
    height: 50px;
    width: 100%;
    border-radius: 16px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--s-color-base-content-primary);
    padding: 0 10px;

    &-msg {
      font-weight: 330;
    }

    &-save {
      color: var(--s-color-theme-accent);
      &:hover {
        cursor: pointer;
      }
    }
  }
  .nft-image {
    position: absolute;
    z-index: 1;
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
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing-medium;

    &-asset {
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
          &-name {
            font-size: var(--s-heading2-font-size);
            line-height: var(--s-line-height-small);
          }
        }
      }
      &-icon {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        white-space: nowrap;
        position: relative;
        margin-right: calc(var(--s-basic-spacing) * 2);
      }
    }

    &-address {
      display: flex;
      flex-flow: column nowrap;
      align-items: flex-start;
      gap: var(--s-basic-spacing);

      font-size: var(--s-font-size-mini);
      font-weight: 600;
      overflow-wrap: break-word;

      span {
        @media screen and (max-width: $telegram-web-app-width) {
          font-size: 9.65px;
        }
      }
    }
  }
}
</style>
