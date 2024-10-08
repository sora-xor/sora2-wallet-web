<template>
  <div class="logo">
    <span :class="iconClasses" :style="iconStyles" />
    <nft-token-logo v-if="isNft" class="asset-logo__nft-image" :class="iconClasses" :asset="token" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../api';
import { LogoSize, ObjectInit } from '../consts';
import { getter } from '../store/decorators';

import TranslationMixin from './mixins/TranslationMixin';
import NftTokenLogo from './NftTokenLogo.vue';

import type { WhitelistIdsBySymbol } from '../types/common';
import type { Asset, AccountAsset, Whitelist, WhitelistItem } from '@sora-substrate/sdk/build/assets/types';

@Component({
  components: {
    NftTokenLogo,
  },
})
export default class TokenLogo extends Mixins(TranslationMixin) {
  @getter.account.whitelist private whitelist!: Whitelist;
  @getter.account.whitelistIdsBySymbol private whitelistIdsBySymbol!: WhitelistIdsBySymbol;

  @Prop({ type: String, default: '' }) readonly tokenSymbol!: string;
  @Prop({ type: Object, default: ObjectInit }) readonly token!: Nullable<AccountAsset | Asset>;
  @Prop({ type: String, default: LogoSize.MEDIUM, required: false }) readonly size!: LogoSize;
  @Prop({ default: false, type: Boolean }) readonly withClickableLogo!: boolean;

  get isNft(): boolean {
    return !!this.token && api.assets.isNft(this.token);
  }

  get assetAddress(): Nullable<string> {
    return this.tokenSymbol ? this.whitelistIdsBySymbol[this.tokenSymbol] : (this.token || {}).address;
  }

  get whitelistedItem(): Nullable<WhitelistItem> {
    if (!(this.token || this.tokenSymbol)) {
      return null;
    }
    const address = this.assetAddress;
    if (!address) {
      return null;
    }
    return this.whitelist[address];
  }

  get iconStyles(): object {
    const asset = this.whitelistedItem;
    if (!asset) {
      return {};
    }
    return {
      'background-size': '100%',
      'background-image': `url("${asset.icon}")`,
    };
  }

  get iconClasses(): Array<string> {
    const questionMark = 's-icon-notifications-info-24';
    const tokenLogoClass = 'asset-logo';
    const classes = [tokenLogoClass];

    if (!this.assetAddress) {
      classes.push(questionMark);
    } else if (!this.whitelistedItem) {
      classes.push(this.isNft ? 'asset-logo-nft' : questionMark);
    }

    classes.push(`${tokenLogoClass}--${this.size.toLowerCase()}`);

    if (this.withClickableLogo) {
      classes.push('asset-logo--clickable');
    }

    return classes;
  }
}
</script>

<style lang="scss" scoped>
$token-background-color: var(--s-color-base-on-accent);
$token-color: var(--s-color-base-content-tertiary);

.logo {
  position: relative;
}
.asset-logo {
  &__nft-image {
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
