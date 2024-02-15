<template>
  <div class="asset-list">
    <recycle-scroller
      :items="assets"
      :item-size="itemHeightValue"
      :buffer="itemHeightValue"
      :style="style"
      key-field="address"
      :class="['asset-list-inner', { 'hidden-scrollbar': !gutterOffset }]"
      ref="wrap"
      @scroll.native="handleScroll"
    >
      <template #before>
        <div v-if="isEmptyList" class="asset-list-empty">
          <slot name="list-empty">{{ t('assets.empty') }}</slot>
        </div>
      </template>
      <template #default="{ item, index }">
        <asset-list-item
          :asset="item"
          :with-clickable-logo="withClickableLogo"
          :selectable="selectable"
          :selected="isSelected(item)"
          :with-fiat="withFiat"
          :key="index"
          :with-tabindex="withTabindex"
          v-on="wrapListeners(item)"
        >
          <template v-for="(_, name) in $scopedSlots" :slot="name" slot-scope="slotData">
            <slot :name="name" v-bind="slotData" />
          </template>
        </asset-list-item>
        <s-divider v-if="divider && index !== assets.length - 1" :key="`${index}-divider`" />
      </template>
    </recycle-scroller>

    <scrollbar
      :move="barMove"
      :size="barSize"
      :scroll-height="scrollHeight"
      class="asset-list-scrollbar"
      @change="scrollTo"
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';

import { delay, getCssVariableValue, getScrollbarWidth } from '../util';

import AssetListItem from './AssetListItem.vue';
import TranslationMixin from './mixins/TranslationMixin';
import Scrollbar from './ScrollBar.vue';

import type { Asset } from '@sora-substrate/util/build/assets/types';
import type { RecycleScroller } from 'vue-virtual-scroller';

@Component({
  components: {
    AssetListItem,
    Scrollbar,
  },
})
export default class AssetList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly assets!: Array<Asset>;
  @Prop({ default: 5, type: Number }) readonly size!: number;
  @Prop({ default: false, type: Boolean }) readonly divider!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withClickableLogo!: boolean;
  @Prop({ default: false, type: Boolean }) readonly selectable!: boolean;
  @Prop({ default: false, type: Array }) readonly selected!: Array<Asset>;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;
  @Prop({ default: true, type: Boolean }) readonly withTabindex!: boolean;
  @Ref('wrap') readonly wrap!: RecycleScroller;

  @Watch('size')
  @Watch('assets')
  private async rerenderScrollbar(): Promise<void> {
    await this.$nextTick();
    this.updateScrollbar();
    this.handleScroll();
  }

  barSize = 0;
  barMove = 0;
  scrollHeight = 0;

  wrapListeners(asset: Asset): { [key: string]: VoidFunction } {
    return Object.entries(this.$listeners).reduce((result, [eventName, handlers]) => {
      return {
        ...result,
        [eventName]: () => (Array.isArray(handlers) ? handlers.map((handler) => handler(asset)) : handlers(asset)),
      };
    }, {});
  }

  get el(): HTMLDivElement {
    return this.wrap.$el;
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

  get gutterOffset(): number {
    return this.assets.length > this.size ? -1 * getScrollbarWidth() : 0;
  }

  get style(): object {
    const dividersHeight = this.divider ? this.size : 0;
    const height = `calc(var(${this.itemHeightCssVar}) * ${this.size} + ${dividersHeight}px)`;
    const marginRight = `${this.gutterOffset}px`;

    return {
      height,
      marginRight,
    };
  }

  async mounted(): Promise<void> {
    await this.waitForAssetsListReady();
    this.updateScrollbar();
  }

  async waitForAssetsListReady(): Promise<void> {
    if (this.wrap && this.wrap.ready) return;
    await delay();
    await this.waitForAssetsListReady();
  }

  private updateScrollbar(): void {
    this.barSize = (this.el.clientHeight * 100) / this.el.scrollHeight;
    this.scrollHeight = this.el.scrollHeight;
  }

  handleScroll(): void {
    this.barMove = (this.el.scrollTop * 100) / this.el.clientHeight;
  }

  scrollTo(value: number): void {
    this.el.scrollTop = value;
  }

  isSelected(asset: Asset): boolean {
    return this.selected.some((selectedAsset) => selectedAsset.address === asset.address);
  }
}
</script>

<style lang="scss">
.asset-list {
  position: relative;
  overflow: hidden;

  &-empty {
    margin-top: $basic-spacing-medium;
    text-align: center;
    @include hint-text;
  }

  &-inner {
    &.hidden-scrollbar {
      scrollbar-width: none;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
    }
  }

  .el-divider {
    margin: 0;
  }

  .scrollbar {
    opacity: 0;
    transition: opacity 0.12s ease-out;
  }

  &:hover,
  &:focus,
  &:active {
    .scrollbar {
      opacity: 1;
      transition: opacity 0.34s ease-out;
    }
  }

  .s-action {
    margin-right: 1px;
  }
}
</style>
