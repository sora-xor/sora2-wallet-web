<template>
  <div ref="container" class="qr-code" :style="{ width: `${size}px`, height: `${size}px` }"></div>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'vue-property-decorator';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import { EncodeHintType, QRCodeDecoderErrorCorrectionLevel } from '@zxing/library';

const writer = new BrowserQRCodeSvgWriter();
const hints = new Map();
hints.set(EncodeHintType.ERROR_CORRECTION, QRCodeDecoderErrorCorrectionLevel.M);

@Component
export default class QrCode extends Vue {
  @Prop({ default: '', type: String }) readonly value!: string;
  @Prop({ default: 260, type: Number }) readonly size!: number;
  @Ref('container') readonly container!: HTMLDivElement;

  @Watch('value')
  private rerender(): void {
    this.renderCode();
  }

  element: Nullable<SVGSVGElement> = null;

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
    this.element = writer.write(this.value, this.size, this.size, hints);
    this.container.appendChild(this.element);
  }
}
</script>

<style lang="scss" scoped>
.qr-code {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--s-color-utility-body);
  border-radius: var(--s-border-radius-small);
  box-shadow: var(--s-shadow-element-pressed);
}
</style>
