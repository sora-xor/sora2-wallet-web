<template>
  <div class="scrollbar" ref="scrollbar" @mousedown="clickTrackHandler">
    <div v-if="visible" ref="thumb" class="thumb" :style="style" @mousedown="clickThumbHandler" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';

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

@Component
export default class Scrollbar extends Vue {
  @Prop({ default: 0, type: Number }) readonly move!: number;
  @Prop({ default: 0, type: Number }) readonly scrollHeight!: number;
  @Prop({ default: 0, type: Number }) readonly size!: number;

  @Ref('scrollbar') readonly scrollbar!: HTMLDivElement;
  @Ref('thumb') readonly thumb!: HTMLDivElement;

  cursorDown = false;

  get style(): object {
    return {
      transform: `translate${bar.axis}(${this.move}%)`,
      height: `${this.size}%`,
    };
  }

  get visible(): boolean {
    return this.size < 100;
  }

  clickThumbHandler(e: MouseEvent): void {
    // prevent click event of right button
    if (e.ctrlKey || e.button === 2) {
      return;
    }
    this.startDrag(e);
    this[bar.axis] =
      e.currentTarget[bar.offset] -
      (e[bar.client] - (e.currentTarget as HTMLElement).getBoundingClientRect()[bar.direction]);
  }

  clickTrackHandler(e: MouseEvent): void {
    const offset = Math.abs((e.target as HTMLElement).getBoundingClientRect()[bar.direction] - e[bar.client]);
    const thumbHalf = this.thumb[bar.offset] / 2;
    const thumbPositionPercentage = ((offset - thumbHalf) * 100) / this.$el[bar.offset];
    const scrollTop = (thumbPositionPercentage * this.scrollHeight) / 100;

    this.$emit('change', scrollTop);
  }

  startDrag(e: Event): void {
    e.stopImmediatePropagation();
    this.cursorDown = true;

    document.addEventListener('mousemove', this.mouseMoveDocumentHandler);
    document.addEventListener('mouseup', this.mouseUpDocumentHandler);
    document.onselectstart = () => false;
  }

  mouseMoveDocumentHandler(e: MouseEvent): void {
    if (!this.cursorDown) return;

    const prevPage = this[bar.axis];

    if (!prevPage) return;

    const offset = (this.scrollbar.getBoundingClientRect()[bar.direction] - e[bar.client]) * -1;
    const thumbClickPosition = this.thumb[bar.offset] - prevPage;
    const thumbPositionPercentage = ((offset - thumbClickPosition) * 100) / this.scrollbar[bar.offset];
    const scrollTop = (thumbPositionPercentage * this.scrollHeight) / 100;

    this.$emit('change', scrollTop);
  }

  mouseUpDocumentHandler(): void {
    this.cursorDown = false;
    this[bar.axis] = 0;
    document.removeEventListener('mousemove', this.mouseMoveDocumentHandler);
    document.onselectstart = null;
  }

  destroyed(): void {
    document.removeEventListener('mouseup', this.mouseUpDocumentHandler);
  }
}
</script>

<style lang="scss" scoped>
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
