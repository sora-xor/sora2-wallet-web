<template>
  <div class="wallet-assets-headline">
    <div class="wallet-assets-headline__content">
      <div v-if="assetsFiatAmount" class="total-fiat-values">
        <span class="total-fiat-values__title">{{ t('assets.totalAssetsValue') }}</span>
        <formatted-amount value-can-be-hidden is-fiat-value integer-only with-left-shift :value="assetsFiatAmount" />
      </div>
      <el-popover popper-class="wallet-assets-headline__popover" trigger="click" :visible-arrow="false">
        <div class="wallet-assets-headline__text">{{ t('filter.showAssets') }}</div>
        <s-radio-group v-model="selectedFilter">
          <s-radio class="radio-btn" v-for="(filter, index) in filterOptions" :key="index" :label="filter">{{
            filter
          }}</s-radio>
        </s-radio-group>
        <s-divider class="wallet-assets-divider__popover" />
        <div class="wallet-assets-headline__switch">
          <s-switch v-model="onlyVerifiedAssets" :disabled="verifiedOnlySwitch" />
          <span>{{ t('filter.verifiedOnly') }}</span>
        </div>
        <div class="wallet-assets-headline__switch">
          <s-switch v-model="zeroBalanceAssets" :disabled="zeroBalanceSwitch" />
          <span>{{ t('filter.zeroBalance') }}</span>
        </div>
        <div class="wallet-assets-headline__button" slot="reference">
          {{ t('filter.show').toUpperCase() }}:
          <span class="wallet-assets-headline__button-option">{{ chosenOptionText.toUpperCase() }}</span>
          <s-icon class="wallet-assets-headline__button-icon" name="basic-settings-24" size="14px" />
        </div>
      </el-popover>
    </div>
    <s-divider class="wallet-assets-divider" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { mutation, state } from '@/store/decorators';
import FormattedAmount from './FormattedAmount.vue';
import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import { WalletAssetFilters, WalletFilteringOptions } from '../consts';

@Component({
  components: {
    FormattedAmount,
  },
})
export default class WalletAssetsHeadline extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ default: '0', type: String }) readonly assetsFiatAmount!: string;

  @state.settings.filters filters!: WalletAssetFilters;
  @mutation.settings.setFilterOptions private setFilterOptions!: (filter: WalletAssetFilters) => void;

  verifiedOnlySwitch = false;
  zeroBalanceSwitch = false;

  get onlyVerifiedAssets(): boolean {
    return this.filters.verifiedOnly;
  }

  set onlyVerifiedAssets(value: boolean) {
    this.updateFilters('verifiedOnly', value);
  }

  get zeroBalanceAssets(): boolean {
    return this.filters.zeroBalance;
  }

  set zeroBalanceAssets(value: boolean) {
    this.updateFilters('zeroBalance', value);
  }

  get selectedFilter(): string {
    return this.filters.option;
  }

  set selectedFilter(value) {
    this.updateFilters('option', value);
  }

  updateFilters(key: string, value: string | boolean): void {
    const filters = {
      ...this.filters,
      [key]: value,
    };

    this.setFilterOptions(filters);
  }

  get filterOptions(): Array<string> {
    return Object.values(WalletFilteringOptions);
  }

  updated(): void {
    if (this.filters.option === WalletFilteringOptions.NFT) {
      // disable verified only switch as there are no whitelisted NFTs.
      this.verifiedOnlySwitch = true;
      if (this.onlyVerifiedAssets === true) {
        this.onlyVerifiedAssets = false;
      }
    } else {
      this.verifiedOnlySwitch = false;
    }
  }

  get chosenOptionText(): string {
    switch (this.filters.option) {
      case WalletFilteringOptions.ALL:
        return this.t('filter.all');
      case WalletFilteringOptions.TOKEN:
        return this.t('filter.token');
      case WalletFilteringOptions.NFT:
        return this.t('filter.nft');
      default:
        return this.t('filter.all');
    }
  }

  mounted(): void {
    this.onlyVerifiedAssets = this.filters.verifiedOnly;
    this.zeroBalanceAssets = this.filters.zeroBalance;
    this.selectedFilter = this.filters.option;
    this.$emit('filter-assets', this.filters);
  }
}
</script>

<style lang="scss" scoped>
.el-radio {
  font-weight: 300;
}
.el-popover {
  padding: 0 !important;
}
</style>

<style lang="scss">
$size-px: 16px;

.radio-btn .el-radio {
  &__label {
    font-size: var(--s-font-size-medium);
  }

  &__inner {
    width: 22px !important;
    height: 22px !important;
  }

  &__inner::after {
    width: 14px !important;
    height: 14px !important;
  }
}
.wallet-assets-headline {
  &__content {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: #{$basic-spacing-extra-small};
    padding-bottom: #{$basic-spacing-extra-small};
    text-align: center;
  }
  &__switch {
    @include switch-block;
    padding-top: 0;
    padding-bottom: calc(var(--s-size-small / 2));

    .el-switch__input:disabled + .el-switch__core {
      background-color: var(--s-color-base-content-tertiary) !important;
    }
  }

  &__text {
    font-size: var(--s-font-size-medium);
    margin-bottom: 4px;
  }

  &__popover {
    background-color: var(--s-color-utility-body) !important;
    border-radius: $size-px !important;
    color: var(--s-color-base-content-primary) !important;
    border: none !important;
    padding: $size-px $size-px 0 $size-px !important;
  }

  &__button {
    background-color: var(--s-color-base-border-primary);
    padding: 3px 8px;
    border-radius: 10px;
    transition: 0s background-color;

    color: var(--s-color-base-content-primary);
    font-weight: 300;
    &-option {
      color: var(--s-color-theme-accent);
    }

    &-icon {
      color: var(--s-color-base-content-tertiary) !important;
      margin-left: 6px;
    }

    &:hover {
      cursor: pointer;
      background-color: var(--s-color-base-border-secondary);
      transition-delay: 0.05s;
    }
  }
}

.total-fiat-values {
  display: flex;
  align-items: baseline;

  &__title {
    text-transform: uppercase;
    padding-right: #{$basic-spacing-extra-mini};
    white-space: nowrap;
    font-weight: 300;
    letter-spacing: var(--s-letter-spacing-small);
  }
  .formatted-amount--fiat-value {
    display: block;
    font-size: var(--s-font-size-small);
    font-weight: 500;
  }
}

.wallet-assets-divider {
  margin: 0 !important;

  &__popover {
    margin: 4px 0 12px !important;
  }
}
</style>
