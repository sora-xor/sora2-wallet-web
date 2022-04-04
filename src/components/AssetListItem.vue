<template>
  <div :class="['s-flex', 'asset', { 'asset--with-fiat': withFiat }]" v-bind="$attrs" v-on="$listeners">
    <i class="asset-logo" :class="iconClasses" :style="iconStyles" />
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

import TranslationMixin from './mixins/TranslationMixin';
import TokenAddress from './TokenAddress.vue';

import { getAssetIconStyles, getAssetIconClasses } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    TokenAddress,
  },
})
export default class AssetListItem extends Mixins(TranslationMixin) {
  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;

  get iconStyles(): object {
    return getAssetIconStyles(this.asset.address);
  }

  get iconClasses(): Array<string> {
    return getAssetIconClasses(this.asset);
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
