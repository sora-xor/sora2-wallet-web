<template>
  <s-scrollbar class="asset-list" :style="style">
    <div v-if="empty" class="asset-list-empty">
      <slot name="empty" />
    </div>

    <template v-for="(asset, index) in assets">
      <slot v-bind="{ asset, index }" />

      <s-divider v-if="divider && index !== assets.length - 1" :key="`${index}-divider`" />
    </template>
  </s-scrollbar>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import type { Asset } from '@sora-substrate/util';

@Component
export default class AssetList extends Mixins() {
  @Prop({ default: () => [], type: Array }) readonly assets!: Array<Asset>;
  @Prop({ default: 5, type: Number }) readonly items!: number;
  @Prop({ default: false, type: Boolean }) readonly divider!: boolean;

  get empty(): boolean {
    return this.assets.length === 0;
  }

  get style() {
    const dividersHeight = this.divider ? this.items - 1 : 0;
    const height = `calc(var(--s-asset-item-height) * ${this.items} + ${dividersHeight}px)`;

    return {
      height,
    };
  }
}
</script>

<style lang="scss">
.asset-list {
  @include scrollbar($basic-spacing-big);

  &-empty {
    margin-top: $basic-spacing-medium;
    text-align: center;
    @include hint-text;
  }

  .el-divider {
    margin: 0;
  }
}
</style>
