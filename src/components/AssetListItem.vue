<template>
  <div :class="['s-flex', 'asset', { 'asset--with-fiat': withFiat }]" v-bind="$attrs" v-on="$listeners">
    <i class="asset-logo" :class="iconClasses" :style="iconStyles" @click="handleOpenAssetDetails" />
    <div class="asset-description s-flex">
      <slot name="value" v-bind="asset">
        <div class="asset-symbol">{{ asset.symbol }}</div>
      </slot>
      <div class="asset-info">
        {{ name }}
        <s-tooltip :content="t('assets.copy')">
          <span class="asset-id" @click="handleCopy">({{ address }})</span>
        </s-tooltip>
      </div>
      <slot name="append" v-bind="asset" />
    </div>
    <slot v-bind="asset" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';

import { RouteNames } from '../consts';
import { copyToClipboard, formatAddress, getAssetIconStyles, getAssetIconClasses } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component
export default class AssetListItem extends Mixins(TranslationMixin) {
  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: false, type: Boolean }) readonly accountAsset!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  get iconStyles(): object {
    return getAssetIconStyles(this.asset.address);
  }

  get iconClasses(): Array<string> {
    return getAssetIconClasses(this.asset);
  }

  get name(): string {
    return this.asset.name || this.asset.symbol;
  }

  get address(): string {
    return formatAddress(this.asset.address, 10);
  }

  handleOpenAssetDetails(event: Event): void {
    if (this.accountAsset) {
      event.stopImmediatePropagation();
      this.$emit('show-details', this.asset);
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.asset } });
    }
  }

  async handleCopy(event: Event): Promise<void> {
    event.stopImmediatePropagation();
    try {
      await copyToClipboard(this.asset.address);
      this.$notify({
        message: this.t('assets.successCopy', { symbol: this.asset.symbol }),
        type: 'success',
        title: '',
      });
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: '',
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/icons';

.asset {
  align-items: center;
  height: var(--s-asset-item-height);

  &--with-fiat {
    height: var(--s-asset-item-height--fiat);
  }

  &-logo {
    flex-shrink: 0;
    @include asset-logo-styles(42px);
    &:hover {
      cursor: pointer;
    }
  }

  &-description {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    line-height: var(--s-line-height-big);
    padding: 0 $basic-spacing-small;
    width: 30%;
  }

  &-symbol {
    font-size: var(--s-font-size-big);
    font-weight: 600;
    letter-spacing: var(--s-letter-spacing-small);
    line-height: var(--s-line-height-extra-small);
  }

  &-info {
    @include hint-text;
    .asset-id {
      outline: none;
      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>
