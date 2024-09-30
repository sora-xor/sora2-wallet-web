<template>
  <div class="assets-filter-wrapper">
    <div :class="computedClasses">
      <el-popover popper-class="assets-filter" trigger="click" :visible-arrow="false">
        <div class="assets-filter__headline">
          <div class="assets-filter__text">{{ t('filter.show') }}</div>
          <div class="assets-filter__text--reset" @click="resetFilter">{{ t('filter.reset') }}</div>
        </div>
        <s-radio-group v-model="selectedFilter" class="assets-filter-options">
          <s-radio size="small" v-for="(filter, index) in filterOptionsText" :key="index" :label="getLabel(index)">
            {{ filter }}
          </s-radio>
        </s-radio-group>
        <div v-if="showOnlyVerifiedSwitch" class="assets-filter__switch--only-verified">
          <s-divider />
          <div class="add-asset-token__switch-btn">
            <s-switch v-model="isVerifiedOnly" :disabled="loading" />
            <span>{{ t(`addAsset.${AddAssetTabs.Token}.switchBtn`) }}</span>
          </div>
        </div>
        <div v-button class="assets-filter__button" slot="reference">
          {{ showText }}:
          <span class="assets-filter__button-option">{{ chosenOptionText }}</span>
          <s-icon class="assets-filter__button-icon" name="basic-settings-24" size="14px" />
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, ModelSync, Prop } from 'vue-property-decorator';

import { AddAssetTabs } from '@/consts';
import { state, mutation } from '@/store/decorators';
import { FilterOptions } from '@/types/common';

import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component
export default class WalletAssetsHeadline extends Mixins(TranslationMixin, LoadingMixin) {
  @state.settings.assetsFilter assetsFilter!: FilterOptions;

  @mutation.settings.setAssetsFilter
  private setFilterOptions!: (filter: FilterOptions) => void;

  @ModelSync('value', 'input', { type: Boolean }) isVerifiedOnly!: boolean;

  @Prop({ default: false, type: Boolean }) readonly showOnlyVerifiedSwitch!: boolean;

  readonly AddAssetTabs = AddAssetTabs;

  get computedClasses(): string {
    const baseClass = ['assets-filter-wrapper__content'];

    return baseClass.join(' ');
  }

  get selectedFilter(): string {
    return this.assetsFilter;
  }

  set selectedFilter(value: FilterOptions) {
    this.setFilterOptions(value);
  }

  getLabel(index: number): string {
    return Object.values(FilterOptions)[index];
  }

  resetFilter(): void {
    this.selectedFilter = FilterOptions.All;
    this.isVerifiedOnly = true;
  }

  get filterOptionsText(): Array<string> {
    const basicOptions = [
      this.t('filter.all'),
      'Native',
      this.TranslationConsts.Kensetsu,
      'Synthetics',
      this.TranslationConsts.Ceres,
    ];

    return basicOptions;
  }

  get chosenOptionText(): string {
    let text = this.t('filter.all');
    switch (this.assetsFilter) {
      case FilterOptions.All:
        text = this.t('filter.all');
        break;
      case FilterOptions.Native:
        text = this.t('filter.native');
        break;
      case FilterOptions.Kensetsu:
        text = this.TranslationConsts.Kensetsu;
        break;
      case FilterOptions.Synthetics:
        text = this.t('filter.synthetics');
        break;
      case FilterOptions.Ceres:
        text = this.TranslationConsts.Ceres;
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
.assets-filter-wrapper {
  &__content {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    flex-wrap: wrap;
    text-align: center;
    font-size: var(--s-font-size-mini);
  }
}

.add-asset-token {
  &__switch-btn {
    display: flex;
    margin-bottom: 14px;
    .s-switch {
      margin-right: 12px;
    }
  }
}
</style>

<style lang="scss">
$size-px: 16px;

.assets-filter {
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

  &__headline {
    display: flex;

    .assets-filter__text--reset {
      position: absolute;
      right: 16px;
      color: var(--s-color-theme-accent);

      &:hover {
        cursor: pointer;
      }
    }
  }

  &-options {
    display: flex !important;
    flex-direction: column;
    margin-bottom: $inner-spacing-medium;
  }

  &__text {
    margin-bottom: 4px;
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

  .el-divider--horizontal {
    margin: 16px 0;
  }
}
</style>
