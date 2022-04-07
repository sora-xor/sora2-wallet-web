<template>
  <div :class="['s-flex', 'asset', { 'asset--with-fiat': withFiat }]" v-bind="$attrs" v-on="$listeners">
    <div class="asset-logo" :class="iconClasses" :style="iconStyles" @click="handleOpenAssetDetails" />
    <nft-token-logo :asset="asset" class="asset-logo__nft-image" />
    <div class="asset-description s-flex">
      <slot name="value" v-bind="asset">
        <div class="asset-symbol">{{ asset.symbol }}</div>
      </slot>
      <token-address :name="asset.name" :symbol="asset.symbol" :address="asset.address" class="asset-info" />
      <slot name="append" v-bind="asset" />
    </div>
    <slot v-bind="asset" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Action } from 'vuex-class';

import NftTokenLogo from './NftTokenLogo.vue';

import TranslationMixin from './mixins/TranslationMixin';
import TokenAddress from './TokenAddress.vue';

import { RouteNames } from '../consts';
import { getAssetIconStyles, getAssetIconClasses } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    NftTokenLogo,
    TokenAddress,
  },
})
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

  handleOpenAssetDetails(event: Event): void {
    if (this.accountAsset) {
      event.stopImmediatePropagation();
      this.$emit('show-details', this.asset);
      this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset: this.asset } });
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
}
</style>
