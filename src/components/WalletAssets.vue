<template>
  <div :class="computedClasses" v-loading="loading">
    <wallet-assets-headline :assets-fiat-amount="assetsFiatAmount" @update-filter="updateFilter" />
    <s-scrollbar class="wallet-assets-scrollbar" :key="scrollbarComponentKey">
      <draggable v-model="assetList" class="wallet-assets__draggable" handle=".wallet-assets-dashes">
        <div v-for="(asset, index) in assetList" :key="asset.address" class="wallet-assets-item__wrapper">
          <div v-if="showAsset(asset)" class="wallet-assets-item s-flex">
            <div class="wallet-assets-dashes"><div class="wallet-assets-three-dash" /></div>
            <asset-list-item
              :asset="asset"
              with-fiat
              show-expiry
              with-clickable-logo
              @show-details="handleOpenAssetDetails"
            >
              <template #value="asset">
                <formatted-amount-with-fiat-value
                  v-if="!asset.isSBT"
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
                  <div v-if="hasLockedBalance(asset)" class="asset-value-locked p4">
                    <s-icon name="lock-16" size="12px" />
                    <span>{{ formatFrozenBalance(asset) }}</span>
                  </div>
                </formatted-amount-with-fiat-value>
                <div v-else class="asset-sbt-meta">
                  <div class="title">
                    KYC <span class="counter">{{ `#${index}` }}</span>
                    <s-icon name="el-icon-success" size="16" />
                  </div>
                  <div class="permissions">
                    <span class="counter">{{ 2 }}</span> Permissions
                  </div>
                </div>
              </template>
              <template #default="asset">
                <s-button
                  v-if="permissions.sendAssets && !isZeroBalance(asset) && !asset.isSBT"
                  class="wallet-assets__button send"
                  type="action"
                  size="small"
                  alternative
                  :tooltip="t('assets.send')"
                  @click="handleAssetSend(asset)"
                >
                  <s-icon name="finance-send-24" size="24" />
                </s-button>
                <s-button
                  v-if="permissions.swapAssets && asset.decimals && !asset.isSBT"
                  class="wallet-assets__button swap"
                  type="action"
                  size="small"
                  alternative
                  :tooltip="t('assets.swap')"
                  @click="handleAssetSwap(asset)"
                >
                  <s-icon name="arrows-swap-24" size="24" />
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
                  <s-icon name="arrows-chevron-right-rounded-24" size="24" />
                </s-button>
              </template>
            </asset-list-item>
            <s-divider :key="`${index}-divider`" class="wallet-assets-divider" />
          </div>
        </div>
        <div v-if="assetsAreHidden" class="wallet-assets--empty">{{ t('addAsset.empty') }}</div>
      </draggable>
    </s-scrollbar>

    <s-button
      v-if="permissions.addAssets"
      class="wallet-assets-add s-typography-button--large"
      @click="handleOpenAddAsset"
    >
      {{ t('addAssetText') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { api, FPNumber } from '@sora-substrate/util';
import isEmpty from 'lodash/fp/isEmpty';
import { Component, Mixins, Watch } from 'vue-property-decorator';
import draggable from 'vuedraggable';

import { RouteNames, HiddenValue, WalletFilteringOptions } from '../consts';
import { state, getter, mutation } from '../store/decorators';

import AssetList from './AssetList.vue';
import AssetListItem from './AssetListItem.vue';
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue';
import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';
import WalletAssetsHeadline from './WalletAssetsHeadline.vue';

import type { WalletAssetFilters, WalletPermissions } from '../consts';
import type { Route } from '../store/router/types';
import type { AccountAsset, Whitelist } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    AssetList,
    AssetListItem,
    FormattedAmountWithFiatValue,
    WalletAssetsHeadline,
    draggable,
  },
})
export default class WalletAssets extends Mixins(LoadingMixin, FormattedAmountMixin, TranslationMixin) {
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @state.settings.shouldBalanceBeHidden private shouldBalanceBeHidden!: boolean;
  @state.settings.permissions permissions!: WalletPermissions;
  @state.settings.filters private filters!: WalletAssetFilters;

  @getter.account.whitelist private whitelist!: Whitelist;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @mutation.account.setAccountAssets private setAccountAssets!: (accountAssets: Array<AccountAsset>) => void;

  @Watch('assetList')
  private updateScrollbar(oldAssets: AccountAsset[], newAssets: AccountAsset[]): void {
    if (oldAssets.length !== newAssets.length) {
      this.scrollbarComponentKey += 1;
    }
  }

  scrollbarComponentKey = 0;
  assetsAreHidden = true;

  isSBT(asset): boolean {
    return !asset.isSBT;
  }

  get assetList(): Array<AccountAsset> {
    return this.accountAssets;
  }

  set assetList(accountAssets: Array<AccountAsset>) {
    if (!accountAssets.length) return;

    const assetsAddresses = accountAssets.map((asset) => asset.address);
    api.assets.accountAssetsAddresses = assetsAddresses;
    api.assets.updateAccountAssets();
    this.setAccountAssets(accountAssets);
  }

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
    if (isEmpty(this.fiatPriceObject)) {
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

  getBalance(asset: AccountAsset): string {
    return `${this.formatCodecNumber(asset.balance.transferable, asset.decimals)}`;
  }

  isZeroBalance(asset: AccountAsset): boolean {
    return this.isCodecZero(asset.balance.transferable, asset.decimals);
  }

  hasLockedBalance(asset: AccountAsset): boolean {
    return !this.isCodecZero(asset.balance.locked, asset.decimals);
  }

  formatFrozenBalance(asset: AccountAsset): string {
    if (this.shouldBalanceBeHidden) {
      return HiddenValue;
    }
    return this.formatCodecNumber(asset.balance.locked, asset.decimals);
  }

  updateFilter(): void {
    this.assetsAreHidden = true;
    this.scrollbarComponentKey += 1;
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

  showAsset(asset: AccountAsset) {
    // filter
    const tokenType = this.filters.option;
    const showWhitelistedOnly = this.filters.verifiedOnly;
    const hideZeroBalance = this.filters.zeroBalance;

    // asset
    const isNft = api.assets.isNft(asset);
    // @ts-expect-error error
    const isSbt = asset.isSBT;
    const isWhitelisted = api.assets.isWhitelist(asset, this.whitelist);
    const hasZeroBalance = !asset.decimals
      ? asset.balance.total === '0' // for non-divisible tokens
      : asset.balance.total[8] === undefined; // for 0.00000009 and less

    if (tokenType === WalletFilteringOptions.SBT && !isSbt) {
      return false;
    }

    if (tokenType === WalletFilteringOptions.Currencies && isNft && isSbt) {
      return false;
    }

    if (tokenType === WalletFilteringOptions.NFT && isSbt) {
      return false;
    }

    if (tokenType === WalletFilteringOptions.NFT && !isNft) {
      return false;
    }

    if (!isWhitelisted && showWhitelistedOnly) {
      return false;
    }

    if (hideZeroBalance && hasZeroBalance) {
      return false;
    }

    // there is at least one asset to show
    this.assetsAreHidden = false;

    return true;
  }
}
</script>

<style lang="scss">
$padding: 5px;

.sortable {
  &-ghost {
    opacity: 0.5;
  }
  &-drag {
    .wallet-assets-divider {
      display: none;
    }
  }
}

.wallet-assets {
  &-item {
    position: relative;
    padding-left: $padding;
    background-color: var(--s-color-utility-surface);
    border-radius: calc(var(--s-border-radius-mini) / 2);
    &__wrapper {
      margin-left: calc(#{$padding} * -1);
    }
  }

  &-dashes {
    position: absolute;
    top: 25%;
    height: 50%;
    width: 10px;
    cursor: grab;
    z-index: 1;
  }

  &-three-dash {
    @include three-dashes(50%);

    &::before {
      content: '';
      @include three-dashes($padding);
    }

    &::after {
      content: '';
      @include three-dashes(calc(#{$padding} * -1));
    }
  }

  &-list {
    @include asset-list($basic-spacing-big, $basic-spacing-big);
  }

  &-scrollbar {
    @include scrollbar($basic-spacing-big);
  }

  &__draggable {
    $dirty-hack-for-users: 32px; // Who doesn't understand that this list is scrollable
    height: calc(var(--s-asset-item-height--fiat) * 3 + #{$dirty-hack-for-users});
  }

  &--empty {
    margin-top: calc(var(--s-basic-spacing) * 2);
    text-align: center;
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-mini);
    font-weight: 300;
    line-height: var(--s-line-height-medium);
    letter-spacing: var(--s-letter-spacing-small);
  }

  .asset {
    .logo {
      margin-left: 20px;
    }

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
        margin-left: $basic-spacing-tiny;
      }
      .formatted-amount__decimal {
        font-weight: 600;
      }

      @include formatted-amount-tooltip;
    }

    &-info {
      margin-top: $basic-spacing-mini;
      color: var(--s-color-base-content-primary);
      line-height: var(--s-line-height-reset);
    }

    &-sbt-meta {
      .title {
        font-weight: 600;

        .counter {
          font-size: 12px;
          font-weight: 450;
        }
      }

      .permissions {
        color: var(--s-color-fiat-value);
        margin-top: -7px;
        margin-bottom: -4px;
        font-size: 11.5px;

        .counter {
          font-size: 13px;
          font-weight: 600;
        }
      }

      .el-icon-success {
        color: var(--s-color-fiat-value);
        margin-left: 4px;
      }
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
$wallet-assets-class: '.wallet-assets';
$wallet-assets-count: 5;

#{$wallet-assets-class} {
  flex-direction: column;
  margin-top: #{$basic-spacing-medium};

  .asset {
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
  }

  &-add {
    margin-top: #{$basic-spacing-medium};
  }

  &__button {
    & + & {
      margin-left: 0;
    }
  }

  &-divider {
    margin: 0;
  }

  &-item {
    display: flex;
    flex-direction: column;
  }
}
</style>
