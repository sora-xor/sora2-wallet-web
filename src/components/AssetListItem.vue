<template>
  <div :class="['s-flex', 'asset', { 'asset--with-fiat': withFiat }]" v-bind="$attrs" v-on="$listeners">
    <div class="asset-logo" :class="iconClasses" :style="iconStyles" />
    <img
      v-show="asset.content && showNftImage"
      class="asset-logo__nft-image"
      :src="nftImageUrl"
      ref="nftImage"
      @load="handleNftImageLoad"
      @error="hideNftImage"
    />
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
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';

import { IpfsStorage } from '../util/ipfsStorage';

import TranslationMixin from './mixins/TranslationMixin';

import { copyToClipboard, formatAddress, getAssetIconStyles, getAssetIconClasses } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component
export default class AssetListItem extends Mixins(TranslationMixin) {
  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;
  @Ref('nftImage') readonly nftImage!: HTMLImageElement;

  showNftImage = false;

  get iconStyles(): object {
    return getAssetIconStyles(this.asset.address);
  }

  get iconClasses(): Array<string> {
    return getAssetIconClasses(this.asset);
  }

  get nftImageUrl(): string {
    if (this.asset.content) {
      return IpfsStorage.constructFullIpfsUrl(this.asset.content);
    }
    return '';
  }

  get name(): string {
    return this.asset.name || this.asset.symbol;
  }

  get address(): string {
    return formatAddress(this.asset.address, 10);
  }

  handleNftImageLoad(): void {
    const imgElement = this.$refs.nftImage as HTMLImageElement;
    if (imgElement) {
      this.showNftImage = imgElement.complete && imgElement.naturalHeight !== 0;
    } else {
      this.showNftImage = false;
    }
  }

  hideNftImage(): void {
    (this.$refs.nftImage as HTMLImageElement).style.display = 'none';
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

    &__nft-image {
      border-radius: 50%;
      object-fit: cover;
      width: var(--s-size-medium);
      height: var(--s-size-medium);
      position: absolute;
      background-color: var(--s-color-base-background);
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
