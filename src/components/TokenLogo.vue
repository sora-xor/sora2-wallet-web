<template>
  <fragment>
    <span :class="iconClasses" :style="iconStyles" @click="handleIconClick" />
    <nft-token-logo
      v-if="token.content"
      :asset="token"
      class="asset-logo asset-logo__nft-image"
      :class="iconClasses"
      @click="handleIconClick"
    />
  </fragment>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import NftTokenLogo from './NftTokenLogo.vue';

import { getAssetIconStyles, getAssetIconClasses } from '../util';
import type { Asset, AccountAsset, Whitelist } from '@sora-substrate/util/build/assets/types';
import { getter, mutation } from '../store/decorators';

import TranslationMixin from '@/components/mixins/TranslationMixin';
import { LogoSize, ObjectInit, RouteNames } from '../consts';

import type { Route } from '../store/router/types';
import type { WhitelistIdsBySymbol } from '../types/common';

@Component({
  components: {
    NftTokenLogo,
  },
})
export default class TokenLogo extends Mixins(TranslationMixin) {
  @getter.account.whitelist whitelist!: Whitelist;
  @getter.account.whitelistIdsBySymbol whitelistIdsBySymbol!: WhitelistIdsBySymbol;
  @mutation.router.navigate private navigate!: (options: Route) => void;

  @Prop({ type: String, default: '' }) readonly tokenSymbol!: string;
  @Prop({ type: Object, default: ObjectInit }) readonly token!: AccountAsset | Asset;
  @Prop({ type: String, default: LogoSize.MEDIUM, required: false }) readonly size!: LogoSize;
  @Prop({ default: false, type: Boolean }) readonly withClickableLogo!: boolean;

  get iconStyles(): object {
    return getAssetIconStyles(this.token.address);
  }

  get iconClasses(): Array<string> {
    let classes = getAssetIconClasses(this.token);

    const tokenLogoClass = 'asset-logo';
    classes = [...classes, tokenLogoClass];
    classes.push(`${tokenLogoClass}--${this.size.toLowerCase()}`);

    if (this.withClickableLogo) {
      classes.push('asset-logo--clickable');
    }

    return classes;
  }

  handleIconClick(): void {
    if (this.withClickableLogo) {
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.token } });
    }
  }
}
</script>

<style lang="scss" scoped>
$token-background-color: var(--s-color-base-on-accent);
$token-color: var(--s-color-base-content-tertiary);

.asset-logo {
  &__nft-image {
    border-radius: 50%;
    object-fit: cover;
    position: absolute !important;
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
        content: 'NFT';
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
        content: 'NFT';
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
        content: 'NFT';
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
        content: 'NFT';
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
        content: 'NFT';
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
        content: 'NFT';
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
