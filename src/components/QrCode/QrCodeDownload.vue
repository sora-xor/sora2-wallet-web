<template>
  <div class="qr-code-download">
    <s-button type="action" size="medium" @click="openFileInput">
      <s-icon name="finance-send-24" size="28" />
    </s-button>
    <input ref="input" type="file" class="qr-code-download__input" @change="handleInput" />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator';
import { BrowserQRCodeReader } from '@zxing/browser';

const reader = new BrowserQRCodeReader();

@Component
export default class QrCodeDownload extends Vue {
  @Ref('input') readonly input!: HTMLInputElement;

  openFileInput() {
    this.input.click();
  }

  async handleInput(event): Promise<Nullable<string>> {
    return new Promise((resolve) => {
      const input = event.target;
      const file = input.files[0];
      const fileReader = new FileReader();
      const handleResolve = (value) => {
        input.value = '';
        resolve(value);
      };

      if (!file) {
        console.warn('no file');
        handleResolve(null);
      }

      fileReader.addEventListener('load', async () => {
        try {
          const base64 = fileReader.result as string;
          const result = await reader.decodeFromImageUrl(base64);
          handleResolve(result.getText());
        } catch (error) {
          console.warn(error);
          handleResolve(null);
        }
      });

      fileReader.readAsDataURL(file);
    });
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
