<template>
  <s-button
    type="action"
    size="medium"
    :tooltip="t('code.upload')"
    class="qr-code-download"
    rounded
    v-bind="$attrs"
    @click="openFileInput"
  >
    <s-icon name="basic-scan-24" size="28" />
    <input ref="input" type="file" class="qr-code-download__input" @change="handleFileInput" />
  </s-button>
</template>

<script lang="ts">
import { Component, Ref, Mixins } from 'vue-property-decorator';
import { BrowserQRCodeReader } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';

import TranslationMixin from './mixins/TranslationMixin';

const hints = new Map();
hints.set(DecodeHintType.PURE_BARCODE, true);
const reader = new BrowserQRCodeReader(hints);

@Component
export default class QrCodeScanButton extends Mixins(TranslationMixin) {
  @Ref('input') readonly input!: HTMLInputElement;

  openFileInput(): void {
    this.input.click();
  }

  private resetFileInput(): void {
    this.input.value = '';
  }

  async handleFileInput(event: Event): Promise<void> {
    const value = await new Promise((resolve) => {
      const input = event.target as HTMLInputElement;

      if (!input) return resolve(null);

      const files = input.files;

      if (!(files instanceof FileList)) return resolve(null);

      const file = files[0] as File;

      if (!file) return resolve(null);

      const fileReader = new FileReader();

      fileReader.addEventListener('load', async () => {
        try {
          const base64 = fileReader.result as string;
          const result = await reader.decodeFromImageUrl(base64);
          resolve(result.getText());
        } catch (error) {
          console.error(error);
          resolve(null);
        }
      });

      fileReader.readAsDataURL(file);
    });

    this.$emit('change', value);
    this.resetFileInput();
  }
}
</script>

<style lang="scss" scoped>
.qr-code-download {
  &__input {
    display: none;
  }
}
</style>
