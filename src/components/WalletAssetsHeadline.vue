<template>
  <div class="wallet-assets-headline">
    <div :class="computedClasses">
      <div v-if="assetsFiatAmount" class="total-fiat-values">
        <span class="total-fiat-values__title">{{ t('assets.totalAssetsValue') }}</span>
        <formatted-amount value-can-be-hidden is-fiat-value integer-only with-left-shift :value="assetsFiatAmount" />
      </div>
      <el-popover popper-class="wallet-assets-filter" trigger="click" :visible-arrow="false">
        <div class="wallet-assets-filter__text">{{ t('filter.showAssets') }}</div>
        <s-radio-group v-model="selectedFilter">
          <s-radio size="small" v-for="(filter, index) in filterOptionsText" :key="index" :label="getLabel(index)">
            {{ filter }}
          </s-radio>
        </s-radio-group>
        <s-divider class="wallet-assets-filter__divider" />
        <div class="wallet-assets-filter__switch">
          <s-switch v-model="onlyVerifiedAssets" :disabled="verifiedOnlySwitchDisabled" />
          <span>{{ t('filter.verifiedOnly') }}</span>
        </div>
        <div class="wallet-assets-filter__switch">
          <s-switch v-model="zeroBalanceAssets" :disabled="zeroBalanceSwitch" />
          <span>{{ t('filter.zeroBalance') }}</span>
        </div>
        <div class="wallet-assets-filter__button" slot="reference">
          {{ showText }}:
          <span class="wallet-assets-filter__button-option">{{ chosenOptionText }}</span>
          <s-icon class="wallet-assets-filter__button-icon" name="basic-settings-24" size="14px" />
        </div>
      </el-popover>
    </div>
    <s-divider class="wallet-assets-headline__divider" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { WalletFilteringOptions } from '../consts';
import { state, getter, mutation } from '../store/decorators';

import FormattedAmount from './FormattedAmount.vue';
import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';

import type { WalletAssetFilters } from '../consts';

enum Filter {
  verifiedOnly = 'verifiedOnly',
  zeroBalance = 'zeroBalance',
  option = 'option',
}

@Component({
  components: {
    FormattedAmount,
  },
})
export default class WalletAssetsHeadline extends Mixins(TranslationMixin, LoadingMixin) {
  @Prop({ default: '0', type: String }) readonly assetsFiatAmount!: string;

  @state.settings.filters filters!: WalletAssetFilters;
  @getter.account.hasSomeSbt hasSomeSbt!: boolean;
  @mutation.settings.setFilterOptions
  private setFilterOptions!: (filter: WalletAssetFilters) => void;

  zeroBalanceSwitch = false;

  get computedClasses(): string {
    const baseClass = ['wallet-assets-headline__content'];
    if (!this.assetsFiatAmount) {
      baseClass.push('wallet-assets-headline__content--no-fiat');
    }
    return baseClass.join(' ');
  }

  get onlyVerifiedAssets(): boolean {
    return this.filters.verifiedOnly;
  }

  set onlyVerifiedAssets(value: boolean) {
    this.updateFilters(Filter.verifiedOnly, value);
  }

  get zeroBalanceAssets(): boolean {
    return this.filters.zeroBalance;
  }

  set zeroBalanceAssets(value: boolean) {
    this.updateFilters(Filter.zeroBalance, value);
  }

  get selectedFilter(): string {
    return this.filters.option;
  }

  set selectedFilter(value) {
    this.updateFilters(Filter.option, value);

    if (this.filters.option === WalletFilteringOptions.NFT) {
      this.onlyVerifiedAssets = false;
    }
  }

  getLabel(index: number): string {
    return Object.values(WalletFilteringOptions)[index];
  }

  updateFilters(key: string, value: string | boolean): void {
    const filters = {
      ...this.filters,
      [key]: value,
    };

    this.setFilterOptions(filters);
    this.$emit('update-filter');
  }

  get filterOptionsText(): Array<string> {
    const basicOptions = [this.t('filter.all'), this.t('filter.token'), this.TranslationConsts.NFT];

    if (this.hasSomeSbt) basicOptions.push(this.TranslationConsts.SBT);

    return basicOptions;
  }

  get verifiedOnlySwitchDisabled(): boolean {
    // disable verified only switch as there are no whitelisted NFTs or SBTs.
    return [WalletFilteringOptions.NFT, WalletFilteringOptions.SBT].includes(this.filters.option);
  }

  get chosenOptionText(): string {
    let text = this.t('filter.all');
    switch (this.filters.option) {
      case WalletFilteringOptions.Currencies:
        text = this.t('filter.token');
        break;
      case WalletFilteringOptions.NFT:
        text = this.TranslationConsts.NFT;
        break;
      case WalletFilteringOptions.SBT:
        text = this.TranslationConsts.SBT;
        break;
    }
    return text.toUpperCase();
  }

  get showText(): string {
    return this.t('filter.show').toUpperCase();
  }
}
</script>

<style lang="scss" scoped>
.wallet-assets-headline {
  &__content {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: #{$basic-spacing-tiny};
    padding-bottom: #{$basic-spacing-tiny};
    text-align: center;
    font-size: var(--s-font-size-mini);

    &--no-fiat > span {
      position: relative;
      left: 100%;
      transform: translateX(-100%);
    }
  }
  &__divider {
    margin: 0;
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
</style>

<style lang="scss">
$size-px: 16px;

.wallet-assets-filter {
  &.el-popover {
    background-color: var(--s-color-utility-body);
    border-radius: $size-px;
    color: var(--s-color-base-content-primary);
    border: none;
    padding: $size-px $size-px 0 $size-px;
    font-size: var(--s-font-size-small);
    .el-radio {
      font-weight: 300;
      margin-right: 20px;
      & .el-radio__label {
        font-size: var(--s-font-size-small);
      }
    }
  }

  &__switch {
    @include switch-block(var(--s-font-size-small));
    & {
      padding-top: 0;
    }
    .s-switch.neumorphic .el-switch__input:disabled + .el-switch__core {
      background-color: var(--s-color-base-border-secondary);
    }
  }

  &__text {
    margin-bottom: 4px;
  }

  &__divider {
    margin: 16px 0;
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

    & &-icon {
      color: var(--s-color-base-content-tertiary);
      margin-left: 6px;
    }

    &:hover {
      cursor: pointer;
      background-color: var(--s-color-base-border-secondary);
      transition-delay: 0.05s;
    }
  }
}
</style>
