<template>
  <div class="asset-list">
    <recycle-scroller
      :items="assets"
      :item-size="itemHeightValue"
      :buffer="itemHeightValue"
      key-field="address"
      class="asset-list-inner"
      :style="style"
    >
      <template #before>
        <div v-if="isEmptyList" class="asset-list-empty">
          <slot name="list-empty">{{ t('assets.empty') }}</slot>
        </div>
      </template>

      <template #default="{ item, index }">
        <asset-list-item :asset="item" :with-fiat="withFiat" :key="index" v-on="wrapListeners(item)">
          <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </asset-list-item>
        <s-divider v-if="divider && index !== assets.length - 1" :key="`${index}-divider`" />
      </template>
    </recycle-scroller>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { RecycleScroller } from 'vue-virtual-scroller';

import TranslationMixin from './mixins/TranslationMixin';
import AssetListItem from './AssetListItem.vue';

import { getCssVariableValue } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';

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

  wrapListeners(asset: Asset): { [key: string]: VoidFunction } {
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

  get style(): object {
    const dividersHeight = this.divider ? this.size - 1 : 0;
    const height = `calc(var(${this.itemHeightCssVar}) * ${this.size} + ${dividersHeight}px)`;

    return {
      height,
    };
  }
}
</script>

<style lang="css">
/* vue-virtual-scroller/dist/vue-virtual-scroller.css */
.vue-recycle-scroller {
  position: relative;
}
.vue-recycle-scroller.direction-vertical:not(.page-mode) {
  overflow-y: auto;
}
.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
  overflow-x: auto;
}
.vue-recycle-scroller.direction-horizontal {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.vue-recycle-scroller__slot {
  -webkit-box-flex: 1;
  -ms-flex: auto 0 0px;
  flex: auto 0 0;
}
.vue-recycle-scroller__item-wrapper {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {
  width: 100%;
}
.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {
  height: 100%;
}
.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {
  width: 100%;
}
.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {
  height: 100%;
}
.resize-observer[data-v-b329ee4c] {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  pointer-events: none;
  display: block;
  overflow: hidden;
  opacity: 0;
}
.resize-observer[data-v-b329ee4c] object {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}
</style>

<style lang="scss">
.asset-list {
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
