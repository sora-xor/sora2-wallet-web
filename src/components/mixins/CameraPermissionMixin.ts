import { Component, Mixins } from 'vue-property-decorator';

import { checkDevicesAvailability, checkCameraPermission } from '@/util';
import TranslationMixin from './TranslationMixin';

@Component
export default class CameraPermissionMixin extends Mixins(TranslationMixin) {
  permissionDialogVisibility = false;

  async checkMediaDevicesAllowance(context: string): Promise<boolean> {
    try {
      const cameraAvailability = await checkDevicesAvailability();

      if (!cameraAvailability) throw new Error(`[${context}]: Cannot find camera device`);

      const cameraPermisssion = await checkCameraPermission();

      if (cameraPermisssion === 'denied') throw new Error(`[${context}]: Check camera browser permissions`);

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
}
