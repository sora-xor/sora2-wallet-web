<template>
  <div>
    <div ref="container" class="qr-code"></div>
    <button @click="exportCode">save</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';

import { svgSaveAs, IMAGE_EXTENSIONS } from '../util/image';

@Component
export default class QrCode extends Vue {
  @Prop({ default: '', type: String }) readonly value!: string;
  @Prop({ default: 300, type: Number }) readonly size!: number;
  @Ref('container') readonly container!: HTMLDivElement;

  readonly codeWriter = new BrowserQRCodeSvgWriter();
  element: SVGSVGElement | null = null;

  mounted(): void {
    this.renderCode();
  }

  clearContainer(): void {
    if (this.container && this.container.firstChild) {
      this.container.firstChild.remove();
    }
  }

  renderCode(): void {
    this.clearContainer();
    this.element = this.codeWriter.write(this.value, this.size, this.size);
    this.container.appendChild(this.element);
  }

  async exportCode(): Promise<void> {
    if (!this.element) return;

    await svgSaveAs(this.element, 'transfer', IMAGE_EXTENSIONS.JPEG);
  }
}
</script>

<style lang="scss" scoped>
.qr-code {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
