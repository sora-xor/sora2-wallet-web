<template>
  <div class="qr-code-container">
    <s-button
      type="action"
      size="medium"
      rounded
      :tooltip="t('code.upload')"
      v-bind="$attrs"
      class="qr-code-button"
      @click="handleButtonClick"
    >
      <s-dropdown
        type="ellipsis"
        border-radius="mini"
        icon="basic-scan-24"
        @select="handleSelect"
        class="qr-code-dropdown"
        ref="dropdown"
      >
        <template #menu>
          <s-dropdown-item icon="basic-dashboard-24" :value="scanTypes.FILE" class="qr-code-dropdown__item">
            {{ t('code.import') }}
          </s-dropdown-item>
          <s-dropdown-item icon="camera-16" :value="scanTypes.STREAM" class="qr-code-dropdown__item">
            {{ t('code.scan') }}
          </s-dropdown-item>
        </template>
      </s-dropdown>
    </s-button>

    <input ref="input" type="file" class="qr-code-file" @change="handleFileInput" />

    <dialog-base :visible.sync="scanerDialog" :title="t('code.upload')">
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
      <template #footer>
        <s-select
          v-if="multipleMediaDevices"
          :value="selectedDeviceId"
          :placeholder="t('code.camera')"
          @input="handleChangeDevice"
          border-radius="mini"
          popper-class="device-select-popper"
        >
          <s-option v-for="(device, index) in mediaDevices" :key="index" :label="device.label" :value="device.deviceId">
            {{ device.label }}
          </s-option>
        </s-select>
      </template>
    </dialog-base>

    <notification-enabling-page v-if="permissionDialogVisibility">{{
      t('code.allowanceRequest')
    }}</notification-enabling-page>
  </div>
</template>

<script lang="ts">
import { Component, Ref, Mixins } from 'vue-property-decorator';
import { BrowserQRCodeReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';

import DialogBase from '../DialogBase.vue';
import NotificationEnablingPage from '../NotificationEnablingPage.vue';

import TranslationMixin from '../mixins/TranslationMixin';

import type SDropdown from '@soramitsu/soramitsu-js-ui/lib/components/Dropdown/SDropdown/SDropdown.vue';

enum SCAN_TYPES {
  FILE = 'file',
  STREAM = 'stream',
}

const reader = new BrowserQRCodeReader();

@Component({
  components: {
    DialogBase,
    NotificationEnablingPage,
  },
})
export default class QrCodeScanButton extends Mixins(TranslationMixin) {
  @Ref('input') readonly input!: HTMLInputElement;
  @Ref('preview') readonly preview!: HTMLVideoElement;
  @Ref('dropdown') readonly dropdown!: SDropdown;

  readonly scanTypes = SCAN_TYPES;

  mediaDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: Nullable<string> = null;

  scanProcess: Nullable<IScannerControls> = null;
  scanDialogVisibility = false;
  permissionDialogVisibility = false;

  get scanerDialog(): boolean {
    return this.scanDialogVisibility;
  }

  set scanerDialog(flag: boolean) {
    this.scanDialogVisibility = flag;

    if (!flag) {
      this.stopScanProcess();
    }
  }

  get multipleMediaDevices(): boolean {
    return this.mediaDevices.length > 1;
  }

  handleButtonClick(): void {
    // emulate click in el-dropdown
    (this.dropdown.$refs.dropdown as SDropdown).handleClick();
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

  async checkCameraPermission(): Promise<string> {
    try {
      const { state } = await navigator.permissions.query({ name: 'camera' } as any);

      return state;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async checkDevicesAvailability(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      return devices.some((device) => device.kind === 'videoinput');
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async checkMediaDevicesAllowance(): Promise<boolean> {
    try {
      const cameraAvailability = await this.checkDevicesAvailability();

      if (!cameraAvailability) throw new Error('[QR Code]: Cannot find camera device');

      const cameraPermisssion = await this.checkCameraPermission();

      if (cameraPermisssion === 'denied') throw new Error('[QR Code]: Check camera browser permissions');

      this.permissionDialogVisibility = cameraPermisssion !== 'granted';
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
    } finally {
      this.permissionDialogVisibility = false;
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

<style lang="scss">
.qr-code {
  &-dropdown {
    &.el-dropdown {
      color: inherit;

      i.el-tooltip.el-dropdown-selfdefine {
        font-size: 28px !important; // override style attr
        color: inherit;
      }
    }

    &__item {
      border-radius: calc(var(--s-border-radius-mini) / 2);
    }
  }
}
.device-select-popper {
  .el-select-dropdown__item {
    border-radius: calc(var(--s-border-radius-mini) / 2);
  }
}
</style>

<style lang="scss" scoped>
$mask-box-border: 2px solid var(--s-color-theme-accent);
$mask-background-color: rgba(13, 13, 13, 0.5);
$mask-box-angles: (
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
  &-container {
    display: inline-block;
  }

  &-file {
    display: none;
  }

  &-stream {
    position: relative;
    overflow: hidden;
    border-radius: var(--s-border-radius-small);
    width: 100%;
    padding-top: 100%;

    &-video {
      position: absolute;
      left: 50%;
      top: 0;
      height: 100%;
      transform: translateX(-50%);
    }
  }
}

.device-select {
  display: flex;
  flex-direction: column;
}

.mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  padding-top: 100%;

  &-bg {
    position: absolute;
    left: 0;
    top: 0;
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
      border-bottom: $mask-box-border;
      animation: radar 4s infinite;
      animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
    }

    &-angle {
      position: absolute;
      width: 15%;
      height: 15%;

      @each $class, $angle in $mask-box-angles {
        &.#{$class} {
          #{nth($angle, 1)}: 0;
          #{nth($angle, 2)}: 0;
          border-#{nth($angle, 2)}: $mask-box-border;
          border-#{nth($angle, 1)}: $mask-box-border;
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
