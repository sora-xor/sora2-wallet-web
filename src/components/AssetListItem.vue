<template>
  <div
    :class="[
      's-flex',
      'asset',
      { 'asset--with-fiat': withFiat },
      { 'asset--selected': selected },
      { 'asset--pinned': pinned },
    ]"
    v-bind="$attrs"
    v-button="withTabindex"
    :tabindex="withTabindex ? 0 : -1"
    v-on="$listeners"
  >
    <token-logo size="big" :token="asset" :with-clickable-logo="withClickableLogo" @click.native="handleIconClick" />
    <div class="asset-description s-flex">
      <slot name="value" v-bind="asset">
        <div class="asset-symbol">{{ asset.symbol }}</div>
      </slot>
      <token-address :name="asset.name" :symbol="asset.symbol" :address="asset.address" class="asset-info" />
      <slot name="append" v-bind="asset" />
    </div>
    <slot v-bind="asset" />
    <div v-if="selectable" class="check">
      <s-icon name="basic-check-mark-24" size="12px" />
    </div>
    <div v-if="pinnable || pinned" class="pin" @click="pin">
      <s-icon name="paperclip-vertical-16" size="16px" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import NftTokenLogo from './NftTokenLogo.vue';
import TokenAddress from './TokenAddress.vue';
import TokenLogo from './TokenLogo.vue';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    NftTokenLogo,
    TokenLogo,
    TokenAddress,
  },
})
export default class AssetListItem extends Mixins(TranslationMixin) {
  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: false, type: Boolean }) readonly withClickableLogo!: boolean;
  @Prop({ default: false, type: Boolean }) readonly selectable!: boolean;
  @Prop({ default: false, type: Boolean }) readonly selected!: boolean;
  @Prop({ default: false, type: Boolean }) readonly pinnable!: boolean;
  @Prop({ default: true, type: Boolean }) readonly pinned!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withTabindex!: boolean;

  handleIconClick(event: Event): void {
    if (!this.withClickableLogo) {
      return;
    }
    if (event) {
      event.stopImmediatePropagation();
    }
    this.$emit('show-details', this.asset);
  }

  pin(event: Event) {
    event.stopPropagation();
    this.$emit('pin', this.asset);
  }
}
</script>

<style lang="scss">
.asset-description {
  .formatted-amount__container {
    width: 100%;
  }
}
</style>

<style lang="scss" scoped>
.asset {
  align-items: center;
  height: var(--s-asset-item-height);
  position: relative;
  width: 100%;

  &--with-fiat {
    height: var(--s-asset-item-height--fiat);
  }

  &-description {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    line-height: var(--s-line-height-big);
    padding: 0 var(--s-basic-spacing);
    width: 30%;
  }

  &-symbol {
    font-size: var(--s-font-size-big);
    font-weight: 600;
    letter-spacing: var(--s-letter-spacing-small);
    line-height: var(--s-line-height-extra-small);
  }

  .check {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--s-color-base-content-secondary);
    border-radius: 50%;
    transition: opacity 150ms, border-color 150ms, background-color 150ms;

    i {
      color: white;
    }
  }

  &--selected .check {
    background: var(--s-color-theme-accent);
    border: 1px solid transparent;
  }

  &:not(&--selected) .check i {
    opacity: 0;
  }

  &:not(:hover):not(&--selected) .check {
    opacity: 0;
  }

  .pin {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    margin-left: 8px;
    cursor: pointer;

    i {
      color: var(--s-color-base-content-tertiary);
      transition: color 150ms;
    }

    &:hover i {
      color: var(--s-color-base-content-secondary);
    }
  }

  &--pinned .pin i {
    color: var(--s-base-content-primary);
  }
}
</style>
