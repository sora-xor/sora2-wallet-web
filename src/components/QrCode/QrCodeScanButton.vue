<template>
  <s-button
    type="action"
    size="medium"
    tooltip="Upload QR Code"
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
import { Component, Ref, Vue } from 'vue-property-decorator';
import { BrowserQRCodeReader } from '@zxing/browser';

const reader = new BrowserQRCodeReader();

@Component
export default class QrCodeScanButton extends Vue {
  @Ref('input') readonly input!: HTMLInputElement;

  openFileInput() {
    this.input.click();
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
          resolve(null);
        }
      });

      fileReader.readAsDataURL(file);
    });

    this.$emit('change', value);
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
