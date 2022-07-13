<template>
  <div>
    <s-dropdown type="ellipsis" icon="basic-scan-24" @select="handleSelect">
      <template #default>
        {{ t('code.upload') }}
      </template>
      <template #menu>
        <s-dropdown-item icon="basic-dashboard-24" :value="scanTypes.FILE"> Import an image </s-dropdown-item>
        <s-dropdown-item icon="camera-16" :value="scanTypes.STREAM"> Scan with camera </s-dropdown-item>
      </template>
    </s-dropdown>

    <input ref="input" type="file" class="qr-code-file" @change="handleFileInput" />

    <dialog-base :visible.sync="scanerDialog" :title="t('code.upload')">
      <s-tabs class="s-flex" :value="selectedDeviceId" @input="handleChangeDevice">
        <s-tab v-for="device in mediaDevices" :key="device.deviceId" :label="device.label" :name="device.deviceId" />
      </s-tabs>
      <video ref="preview" class="qr-code-stream" />
    </dialog-base>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Mixins } from 'vue-property-decorator';
import { BrowserQRCodeReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

import DialogBase from '../DialogBase.vue';

import TranslationMixin from '../mixins/TranslationMixin';

enum SCAN_TYPES {
  FILE = 'file',
  STREAM = 'stream',
}

const reader = new BrowserQRCodeReader();

@Component({
  components: {
    DialogBase,
  },
})
export default class QrCodeScanButton extends Mixins(TranslationMixin) {
  @Ref('input') readonly input!: HTMLInputElement;
  @Ref('preview') readonly preview!: HTMLVideoElement;

  readonly scanTypes = SCAN_TYPES;

  mediaDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: Nullable<string> = null;

  scanProcess: Nullable<IScannerControls> = null;
  scanDialogVisibility = false;

  get scanerDialog(): boolean {
    return this.scanDialogVisibility;
  }

  set scanerDialog(flag: boolean) {
    this.scanDialogVisibility = flag;

    if (!flag) {
      this.stopScanProcess();
    }
  }

  handleSelect(value: SCAN_TYPES): void {
    if (value === SCAN_TYPES.FILE) {
      this.openFileInput();
    } else {
      this.openScanDialog();
    }
  }

  async handleChangeDevice(deviceId: string): Promise<void> {
    this.selectedDeviceId = deviceId;
    this.startScanProcess();
  }

  async openScanDialog(): Promise<void> {
    try {
      // request to allow use camera
      await navigator.mediaDevices.getUserMedia({ video: true });
      // find video devices
      this.mediaDevices = await BrowserQRCodeReader.listVideoInputDevices();
      // if no video devices, return
      if (!this.mediaDevices.length) return;
      // open dialog
      this.scanerDialog = true;
      await this.$nextTick();

      await this.handleChangeDevice(this.mediaDevices[0].deviceId);
    } catch (error) {
      console.error('[QR Code]: Scan error.', error);
      this.scanerDialog = false;
    }
  }

  private async startScanProcess(): Promise<void> {
    if (!this.selectedDeviceId) return;

    // stop current scan
    this.stopScanProcess();

    console.info(`[QR Code]: Started decode from camera with id ${this.selectedDeviceId}`);

    // start scan process
    this.scanProcess = await reader.decodeFromVideoDevice(this.selectedDeviceId, this.preview, (result) => {
      if (result) {
        this.$emit('change', result.getText());
        this.scanerDialog = false;
      }
    });
  }

  private stopScanProcess(): void {
    if (this.scanProcess) {
      this.scanProcess.stop();
      this.scanProcess = null;
    }
  }

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
.qr-code {
  &-file {
    display: none;
  }
  &-stream {
    width: 100%;
    border-radius: var(--s-border-radius-small);
  }
}
</style>
