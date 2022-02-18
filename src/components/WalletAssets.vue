<template>
  <div :class="computedClasses" v-loading="loading">
    <template v-if="assetsFiatAmount">
      <div class="total-fiat-values">
        <span class="total-fiat-values__title">{{ t('assets.totalAssetsValue') }}</span>
        <formatted-amount value-can-be-hidden is-fiat-value integer-only with-left-shift :value="assetsFiatAmount" />
      </div>
      <s-divider class="wallet-assets-item_divider" />
    </template>
    <s-scrollbar v-if="!!formattedAccountAssets.length" class="wallet-assets-scrollbar">
      <div class="wallet-assets-container">
        <template v-for="(asset, index) in formattedAccountAssets">
          <div class="wallet-assets-item s-flex" :key="asset.address">
            <i class="asset-logo" :class="nftIconClass(asset)" :style="getAssetIconStyles(asset.address)" />
            <div class="asset s-flex">
              <formatted-amount-with-fiat-value
                value-can-be-hidden
                value-class="asset-value"
                :value="getBalance(asset)"
                :font-size-rate="FontSizeRate.SMALL"
                :asset-symbol="asset.symbol"
                symbol-as-decimal
                :fiat-value="getFiatBalance(asset)"
                :fiat-font-size-rate="FontSizeRate.MEDIUM"
                :fiat-font-weight-rate="FontWeightRate.MEDIUM"
              >
                <div v-if="hasFrozenBalance(asset)" class="asset-value-locked p4">
                  <s-icon name="lock-16" size="12px" />
                  <span>{{ formatFrozenBalance(asset) }}</span>
                </div>
              </formatted-amount-with-fiat-value>
              <div class="asset-info">
                {{ asset.name || asset.symbol }}
                <s-tooltip :content="copyTooltip">
                  <span class="asset-id" @click="handleCopyAddress(asset.address)">
                    ({{ getFormattedAddress(asset) }})
                  </span>
                </s-tooltip>
              </div>
            </div>
            <s-button
              v-if="permissions.sendAssets"
              class="wallet-assets__button send"
              type="action"
              size="small"
              alternative
              :tooltip="t('assets.send')"
              :disabled="isZeroBalance(asset)"
              @click="handleAssetSend(asset)"
            >
              <s-icon name="finance-send-24" size="28" />
            </s-button>
            <s-button
              v-if="permissions.swapAssets"
              class="wallet-assets__button swap"
              type="action"
              size="small"
              alternative
              :tooltip="t('assets.swap')"
              @click="handleAssetSwap(asset)"
            >
              <s-icon name="arrows-swap-24" size="28" />
            </s-button>
            <s-button
              v-if="permissions.showAssetDetails"
              class="wallet-assets__button el-button--details"
              type="action"
              size="small"
              alternative
              :tooltip="t('assets.details')"
              @click="handleOpenAssetDetails(asset)"
            >
              <s-icon name="arrows-chevron-right-rounded-24" size="28" />
            </s-button>
          </div>
          <s-divider
            v-if="index !== formattedAccountAssets.length - 1"
            class="wallet-assets-item_divider"
            :key="`${asset.address}-divider`"
          />
        </template>
      </div>
    </s-scrollbar>
    <div v-else class="wallet-assets-empty">{{ t('assets.empty') }}</div>
    <s-button
      v-if="permissions.addAssets"
      class="wallet-assets-add s-typography-button--large"
      @click="handleOpenAddAsset"
    >
      {{ t('assets.add') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';
import { FPNumber } from '@sora-substrate/util';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';
import { api } from '../api';

import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import LoadingMixin from './mixins/LoadingMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import FormattedAmount from './FormattedAmount.vue';
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue';
import { RouteNames, HiddenValue } from '../consts';
import { getAssetIconStyles, formatAddress } from '../util';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    FormattedAmount,
    FormattedAmountWithFiatValue,
  },
})
export default class WalletAssets extends Mixins(LoadingMixin, FormattedAmountMixin, CopyAddressMixin) {
  @Getter accountAssets!: Array<AccountAsset>;
  @Getter withoutFiatAndApy!: boolean;
  @Getter permissions!: WalletPermissions;
  @Getter shouldBalanceBeHidden!: boolean;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  get computedClasses(): string {
    const baseClass = 'wallet-assets';
    const classes = [baseClass];

    if (this.assetsFiatAmount) {
      classes.push(`${baseClass}--fiat`);
    }

    return classes.concat('s-flex').join(' ');
  }

  get formattedAccountAssets(): Array<AccountAsset> {
    return this.accountAssets.filter((asset) => asset.balance && !Number.isNaN(+asset.balance.transferable));
  }

  get assetsFiatAmount(): Nullable<string> {
    if (!this.formattedAccountAssets || this.withoutFiatAndApy) {
      return null;
    }
    if (!this.formattedAccountAssets.length) {
      return '0';
    }
    const fiatAmount = this.formattedAccountAssets.reduce((sum: FPNumber, asset: AccountAsset) => {
      const price = this.getAssetFiatPrice(asset);
      return price
        ? sum.add(
            this.getFPNumberFromCodec(asset.balance.transferable, asset.decimals).mul(FPNumber.fromCodecValue(price))
          )
        : sum;
    }, new FPNumber(0));
    return fiatAmount ? fiatAmount.toLocaleString() : null;
  }

  nftIconClass(asset): string {
    return api.assets.isNft(asset) ? 'nft-asset' : '';
  }

  getFormattedAddress(asset: AccountAsset): string {
    return formatAddress(asset.address, 10);
  }

  getAssetIconStyles = getAssetIconStyles;

  getBalance(asset: AccountAsset): string {
    return `${this.formatCodecNumber(asset.balance.transferable, asset.decimals)}`;
  }

  isZeroBalance(asset: AccountAsset): boolean {
    return this.isCodecZero(asset.balance.transferable, asset.decimals);
  }

  hasFrozenBalance(asset: AccountAsset): boolean {
    return !this.isCodecZero(asset.balance.frozen, asset.decimals);
  }

  formatFrozenBalance(asset: AccountAsset): string {
    if (this.shouldBalanceBeHidden) {
      return HiddenValue;
    }
    return this.formatCodecNumber(asset.balance.frozen, asset.decimals);
  }

  handleAssetSwap(asset: AccountAsset): void {
    this.$emit('swap', asset);
  }

  handleAssetSend(asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletSend, params: { asset } });
  }

  handleOpenAssetDetails(asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset } });
  }

  handleOpenAddAsset(): void {
    this.navigate({ name: RouteNames.AddAsset });
  }
}
</script>

<style lang="scss">
.wallet-assets {
  &-scrollbar {
    @include scrollbar($basic-spacing-big);
  }
  .asset {
    .formatted-amount {
      display: block;
      width: 100%;
      line-height: var(--s-line-height-reset);
      &__container {
        justify-content: flex-start;
        text-align: left;
      }
      &--fiat-value {
        margin-top: $basic-spacing-mini;
      }
    }
    &-value {
      height: $basic-spacing-medium;
      font-size: var(--s-font-size-medium);
      font-weight: 800;
      letter-spacing: var(--s-letter-spacing-mini);
      line-height: var(--s-line-height-reset);
      &-locked {
        margin-left: $basic-spacing-extra-small;
      }
      .formatted-amount__decimal {
        font-weight: 600;
      }

      @include formatted-amount-tooltip;
    }
  }

  &__button.el-button.neumorphic.s-action:not(.s-primary).s-alternative {
    &:disabled {
      &,
      & > span > i {
        color: var(--s-color-base-background);
      }
    }
    &:not(:disabled) {
      &:hover,
      &:focus {
        color: var(--s-color-theme-accent-hover);
      }
      &:active,
      &.s-pressed {
        color: var(--s-color-theme-accent-pressed);
      }
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

$wallet-assets-class: '.wallet-assets';
$wallet-assets-count: 5;

#{$wallet-assets-class} {
  flex-direction: column;
  margin-top: #{$basic-spacing-medium};

  &--fiat {
    #{$wallet-assets-class}-container {
      max-height: calc(#{$asset-item-height--fiat} * #{$wallet-assets-count} + 4px);
    }
    #{$wallet-assets-class}-item {
      height: $asset-item-height--fiat;
    }
  }

  &-container {
    max-height: calc((#{$asset-item-height} * #{$wallet-assets-count}) + 4px);
  }
  &-item {
    align-items: center;
    height: $asset-item-height;

    .asset {
      flex: 1;
      overflow-wrap: break-word;
      flex-direction: column;
      padding-right: var(--s-basic-spacing);
      padding-left: var(--s-basic-spacing);
      width: 30%;
      justify-content: center;
      &-value,
      &-info {
        line-height: var(--s-line-height-base);
      }
      &-info {
        margin-top: $basic-spacing-mini;
        @include hint-text(var(--s-line-height-reset));
        color: var(--s-color-base-content-primary);
      }
      &-id {
        outline: none;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
      &-value-locked {
        display: inline-flex;
        align-items: center;
        background-color: var(--s-color-base-content-secondary);
        color: var(--s-color-base-on-accent);
        padding: 2px 7px;
        line-height: 1;
        border-radius: var(--s-border-radius-mini);
        max-width: 100%;
        > .s-icon-lock-16 {
          color: var(--s-color-base-on-accent);
        }
        > span {
          margin-left: #{$basic-spacing-mini};
          white-space: nowrap;
        }
      }
      &-converted {
        @include hint-text;
      }
    }
    .asset-logo {
      flex-shrink: 0;
      @include asset-logo-styles;
    }
    &_divider {
      margin: 0;
    }
  }
  &-add,
  &-empty {
    margin-top: #{$basic-spacing-medium};
  }
  &-empty {
    text-align: center;
    @include hint-text;
  }
  &__button {
    & + & {
      margin-left: 0;
    }
  }

  .total-fiat-values {
    display: flex;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    padding-top: #{$basic-spacing-extra-small};
    padding-bottom: #{$basic-spacing-extra-small};
    text-align: center;
    &__title {
      text-transform: uppercase;
      padding-right: #{$basic-spacing-extra-mini};
      white-space: nowrap;
      font-weight: 400;
      letter-spacing: var(--s-letter-spacing-small);
    }
    .formatted-amount--fiat-value {
      display: block;
      font-size: var(--s-font-size-medium);
      font-weight: 600;
    }
  }
}

.nft-asset {
  background-image: none !important;
  background-color: #f4f0f1 !important;
  position: relative;
  font-style: unset;

  &::before {
    content: 'NFT';
    position: absolute;
    font-weight: 800;
    top: 28%;
    left: 14%;
    color: var(--s-color-base-content-tertiary);
  }
}
</style>
