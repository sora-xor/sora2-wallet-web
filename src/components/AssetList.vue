<template>
  <div class="asset-list-container">
    <div class="asset-list-wrapper">
      <recycle-scroller
        :items="assets"
        :item-size="itemHeightValue"
        :buffer="itemHeightValue"
        key-field="address"
        class="asset-list el-scrollbar"
        :style="style"
      >
        <template #before>
          <div v-if="isEmptyList" class="asset-list-empty">
            <slot name="list-empty">{{ t('assets.empty') }}</slot>
          </div>
        </template>

        <template #default="{ item, index }">
          <asset-list-item :asset="item" :withFiat="withFiat" :key="index" v-on="wrapListeners(item)">
            <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
              <slot :name="name" v-bind="slotData" />
            </template>
          </asset-list-item>
          <s-divider v-if="divider && index !== assets.length - 1" :key="`${index}-divider`" />
        </template>
      </recycle-scroller>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { RecycleScroller } from 'vue-virtual-scroller';

import TranslationMixin from './mixins/TranslationMixin';
import AssetListItem from './AssetListItem.vue';

import { getCssVariableValue } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

@Component({
  components: {
    RecycleScroller,
    AssetListItem,
  },
})
export default class AssetList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly assets!: Array<Asset>;
  @Prop({ default: 5, type: Number }) readonly size!: number;
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

  get isEmptyList(): boolean {
    return this.assets.length === 0;
  }

  get itemHeightCssVar(): string {
    return `--s-asset-item-height${this.withFiat ? '--fiat' : ''}`;
  }

  get itemHeightValue(): number {
    return parseFloat(getCssVariableValue(this.itemHeightCssVar)) + Number(this.divider);
  }

  get style() {
    const dividersHeight = this.divider ? this.size - 1 : 0;
    const height = `calc(var(${this.itemHeightCssVar}) * ${this.size} + ${dividersHeight}px)`;

    return {
      height,
    };
  }
}
</script>

<style lang="scss">
.asset-list {
  &-wrapper {
    overflow: hidden;
  }

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
