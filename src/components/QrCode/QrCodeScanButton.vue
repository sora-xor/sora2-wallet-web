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
      <div class="qr-code-stream">
        <video ref="preview" class="qr-code-stream-video" />
        <div class="mask">
          <div class="mask-box">
            <div class="mask-box-angle top-left"></div>
            <div class="mask-box-angle top-right"></div>
            <div class="mask-box-angle bottom-left"></div>
            <div class="mask-box-angle bottom-right"></div>
            <div class="mask-box-line"></div>
          </div>
          <div class="mask-bg"></div>
        </div>
      </div>
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

  async checkMediaDevicesAllowance(): Promise<boolean> {
    try {
      // request to allow use camera
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error(error);

      this.$notify({
        message: this.t('code.allowanceError'),
        type: 'error',
        title: '',
      });

      return false;
    }
  }

  async openScanDialog(): Promise<void> {
    try {
      const mediaDevicesAllowance = await this.checkMediaDevicesAllowance();

      if (!mediaDevicesAllowance) return;

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
$preview-max-width: 480px;
$mask-background-color: rgba(13, 13, 13, 0.5);
$box-border: 2px solid var(--s-color-theme-accent);
$angles: (
  'top-left': (
    'top',
    'left',
  ),
  'top-right': (
    'top',
    'right',
  ),
  'bottom-left': (
    'bottom',
    'left',
  ),
  'bottom-right': (
    'bottom',
    'right',
  ),
);

.qr-code {
  &-file {
    display: none;
  }
  &-stream {
    position: relative;
    overflow: hidden;
    border-radius: var(--s-border-radius-small);
    max-width: $preview-max-width;

    &-video {
      width: 100%;
    }
  }
}

.mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: $preview-max-width;
  height: $preview-max-width;

  &-bg {
    width: 100%;
    height: 100%;
    clip-path: polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%);
    background-color: $mask-background-color;
  }

  &-box {
    position: absolute;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;

    &-line {
      width: 100%;
      height: 100%;
      border-bottom: $box-border;
      animation: radar 4s infinite;
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
    }

    &-angle {
      position: absolute;
      width: var(--s-size-medium);
      height: var(--s-size-medium);

      @each $class, $angle in $angles {
        &.#{$class} {
          #{nth($angle, 1)}: 0;
          #{nth($angle, 2)}: 0;
          border-#{nth($angle, 2)}: $box-border;
          border-#{nth($angle, 1)}: $box-border;
          border-#{nth($angle, 1)}-#{nth($angle, 2)}-radius: 4px;
        }
      }
    }
  }
}

@keyframes radar {
  0% {
    transform: translateY(-75%);
  }

  50% {
    transform: translateY(-25%);
  }

  100% {
    transform: translateY(-75%);
  }
}
</style>
