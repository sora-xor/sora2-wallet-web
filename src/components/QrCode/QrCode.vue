<template>
  <div ref="container" class="qr-code"></div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { BrowserQRCodeSvgWriter, BrowserQRCodeReader } from '@zxing/browser';

const writer = new BrowserQRCodeSvgWriter();
const reader = new BrowserQRCodeReader();

@Component
export default class QrCode extends Vue {
  @Prop({ default: '', type: String }) readonly value!: string;
  @Prop({ default: 300, type: Number }) readonly size!: number;
  @Ref('container') readonly container!: HTMLDivElement;

  @Watch('value')
  private rerender() {
    this.renderCode();
  }

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
    this.element = writer.write(this.value, this.size, this.size);
    this.container.appendChild(this.element);
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
