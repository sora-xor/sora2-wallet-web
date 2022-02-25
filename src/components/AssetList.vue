<template>
  <s-scrollbar class="asset-list" :style="style">
    <div v-if="empty" class="asset-list-empty">
      <slot name="list-empty">{{ t('assets.empty') }}</slot>
    </div>

    <template v-for="(asset, index) in assets">
      <asset-list-item :asset="asset" :key="index" v-on="wrapListeners(asset)">
        <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </asset-list-item>

      <s-divider v-if="divider && index !== assets.length - 1" :key="`${index}-divider`" />
    </template>
  </s-scrollbar>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import AssetListItem from './AssetListItem.vue';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    AssetListItem,
  },
})
export default class AssetList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly assets!: Array<Asset>;
  @Prop({ default: 5, type: Number }) readonly items!: number;
  @Prop({ default: false, type: Boolean }) readonly divider!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;

  wrapListeners(asset: Asset) {
    return Object.entries(this.$listeners).reduce((result, [eventName, handlers]) => {
      return {
        ...result,
        [eventName]: () => (Array.isArray(handlers) ? handlers.map((handler) => handler(asset)) : handlers(asset)),
      };
    }, {});
  }

  get empty(): boolean {
    return this.assets.length === 0;
  }

  get style() {
    const dividersHeight = this.divider ? this.items - 1 : 0;
    const itemHeight = `--s-asset-item-height${this.withFiat ? '--fiat' : ''}`;
    const height = `calc(var(${itemHeight}) * ${this.items} + ${dividersHeight}px)`;

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
