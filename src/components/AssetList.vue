<template>
  <div class="asset-list">
    <recycle-scroller
      :items="assets"
      :item-size="itemHeightValue"
      :buffer="itemHeightValue"
      :style="style"
      key-field="address"
      class="asset-list-inner"
      ref="wrap"
      @scroll.native="handleScroll"
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

    <div class="scrollbar" ref="scrollbar" @mousedown="clickTrackHandler">
      <div ref="thumb" class="thumb" :style="renderThumbStyle" @mousedown="clickThumbHandler" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import AssetListItem from './AssetListItem.vue';

import { getCssVariableValue } from '../util';

import type { Asset } from '@sora-substrate/util/build/assets/types';
import type { RecycleScroller } from 'vue-virtual-scroller';

const bar = {
  offset: 'offsetHeight',
  scroll: 'scrollTop',
  scrollSize: 'scrollHeight',
  size: 'height',
  key: 'vertical',
  axis: 'Y',
  client: 'clientY',
  direction: 'top',
};

@Component({
  components: {
    AssetListItem,
  },
})
export default class AssetList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly assets!: Array<Asset>;
  @Prop({ default: 5, type: Number }) readonly size!: number;
  @Prop({ default: false, type: Boolean }) readonly divider!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;
  @Ref('wrap') readonly wrap!: RecycleScroller;

  barHeight = '';
  barMove = 0;
  cursorDown = false;

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

  get style(): object {
    const dividersHeight = this.divider ? this.size - 1 : 0;
    const height = `calc(var(${this.itemHeightCssVar}) * ${this.size} + ${dividersHeight}px)`;

    return {
      height,
    };
  }

  async mounted() {
    await this.$nextTick();

    this.barHeight = `${(this.el.clientHeight * 100) / this.el.scrollHeight}%`;
  }

  handleScroll() {
    this.barMove = (this.el.scrollTop * 100) / this.el.clientHeight;
  }

  clickThumbHandler(e) {
    // prevent click event of right button
    if (e.ctrlKey || e.button === 2) {
      return;
    }
    this.startDrag(e);
    this[bar.axis] =
      e.currentTarget[bar.offset] - (e[bar.client] - e.currentTarget.getBoundingClientRect()[bar.direction]);
  }

  clickTrackHandler(e) {
    const offset = Math.abs(e.target.getBoundingClientRect()[bar.direction] - e[bar.client]);
    const thumbHalf = (this.$refs.thumb as any)[bar.offset] / 2;
    console.log(offset, thumbHalf);
    const thumbPositionPercentage = ((offset - thumbHalf) * 100) / this.$el[bar.offset];

    const scrollTop = (thumbPositionPercentage * this.el[bar.scrollSize]) / 100;

    console.log(scrollTop);

    this.el[bar.scroll] = (thumbPositionPercentage * this.el[bar.scrollSize]) / 100;
    this.handleScroll();
  }

  startDrag(e) {
    e.stopImmediatePropagation();
    this.cursorDown = true;

    document.addEventListener('mousemove', this.mouseMoveDocumentHandler);
    document.addEventListener('mouseup', this.mouseUpDocumentHandler);
    document.onselectstart = () => false;
  }

  mouseMoveDocumentHandler(e) {
    if (this.cursorDown === false) return;
    const prevPage = this[bar.axis];

    if (!prevPage) return;

    const offset = ((this.$refs.scrollbar as any).getBoundingClientRect()[bar.direction] - e[bar.client]) * -1;
    const thumbClickPosition = (this.$refs.thumb as any)[bar.offset] - prevPage;
    const thumbPositionPercentage = ((offset - thumbClickPosition) * 100) / (this.$refs.scrollbar as any)[bar.offset];

    this.el[bar.scroll] = (thumbPositionPercentage * this.el[bar.scrollSize]) / 100;
    this.handleScroll();
  }

  mouseUpDocumentHandler(e) {
    this.cursorDown = false;
    this[bar.axis] = 0;
    document.removeEventListener('mousemove', this.mouseMoveDocumentHandler);
    document.onselectstart = null;
  }

  destroyed() {
    document.removeEventListener('mouseup', this.mouseUpDocumentHandler);
  }

  get renderThumbStyle() {
    const style: any = {};
    const translate = `translate${bar.axis}(${this.barMove}%)`;

    style[bar.size] = this.barHeight;
    style.transform = translate;
    style.msTransform = translate;
    style.webkitTransform = translate;

    return style;
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
    margin-right: -17px;
  }

  .el-divider {
    margin: 0;
  }
}

.scrollbar {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 6px;

  .thumb {
    width: 100%;
    background: var(--s-color-base-content-tertiary);
    border-radius: 6px;
    cursor: pointer;
  }
}
</style>
