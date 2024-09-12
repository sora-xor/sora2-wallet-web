<template>
  <img
    v-show="asset.content && showSbtImage"
    class="asset-logo sbt-image"
    ref="nftImage"
    alt="SBT"
    :src="sbtImageUrl"
    @load="handleSbtImageLoad"
    @error="hideSbtImage"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Ref } from 'vue-property-decorator';

import { IpfsStorage } from '../../util/ipfsStorage';

import type { Asset } from '@sora-substrate/sdk/build/assets/types';

@Component
export default class SbtTokenLogo extends Vue {
  @Prop({ default: () => {}, type: Object, required: true }) readonly asset!: Asset;
  @Ref('sbtImage') readonly nftImage!: HTMLImageElement;

  showSbtImage = false;

  get sbtImageUrl(): string {
    if (this.asset.content) {
      return IpfsStorage.constructFullIpfsUrl(this.asset.content);
    }
    return '';
  }

  handleSbtImageLoad(): void {
    const imgElement = this.nftImage as HTMLImageElement;
    if (imgElement) {
      this.showSbtImage = imgElement.complete && imgElement.naturalHeight !== 0;
    } else {
      this.showSbtImage = false;
    }
  }

  hideSbtImage(): void {
    this.showSbtImage = false;
  }
}
</script>

<style lang="scss">
$token-background-color: var(--s-color-base-on-accent);
$token-color: var(--s-color-base-content-tertiary);

.logo {
  position: relative;
}
.asset-logo {
  &__sbt-image {
    border-radius: 50%;
    object-fit: cover;
    position: absolute !important;
    top: 0;
    left: 0;
  }

  &--clickable {
    cursor: pointer;
  }
}

@mixin token-logo-size($size: '') {
  $className: 'asset-logo';
  @if ($size == 'mini') {
    $size-px: 16px;
    $classNameMini: '#{$className}--mini';
    @include element-size($classNameMini, $size-px);
    .#{$classNameMini} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 12px;
      color: var(--s-color-base-content-tertiary);
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 6px;
      }
    }
  } @else if ($size == 'small') {
    $size-px: 24px;
    $classNameSmall: '#{$className}--small';
    @include element-size($classNameSmall, $size-px);
    .#{$classNameSmall} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 18px;
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 8px;
        font-weight: 800;
      }
    }
  } @else if ($size == 'medium') {
    $size-px: 32px;
    $classNameMedium: '#{$className}--medium';
    @include element-size($classNameMedium, $size-px);
    .#{$classNameMedium} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 24px;
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 12px;
        font-weight: 800;
      }
    }
  } @else if ($size == 'big') {
    $size-px: var(--s-size-medium);
    $classNameBig: '#{$className}--big';
    @include element-size($classNameBig, $size-px);
    .#{$classNameBig} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 32px;
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 14px;
        font-weight: 800;
      }
    }
  } @else if ($size == 'bigger') {
    $size-px: 48px;
    $classNameBig: '#{$className}--bigger';
    @include element-size($classNameBig, $size-px);
    .#{$classNameBig} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 32px;
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 14px;
        font-weight: 800;
      }
    }
  } @else if ($size == 'large') {
    $size-px: 80px;
    $classNameLarge: '#{$className}--large';
    @include element-size($classNameLarge, $size-px);
    .#{$classNameLarge} {
      @include asset-logo-styles;
      line-height: $size-px;
      font-size: 64px;
      &.#{$className}-nft::before {
        content: 'SBT';
        font-size: 28px;
        font-weight: 800;
      }
    }
  }
}

@include token-logo-size('mini');
@include token-logo-size('small');
@include token-logo-size('medium');
@include token-logo-size('big');
@include token-logo-size('bigger');
@include token-logo-size('large');
</style>
