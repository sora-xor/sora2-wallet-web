import { Component, Mixins } from 'vue-property-decorator';

import { checkDevicesAvailability, checkCameraPermission } from '../../util';

import NotificationMixin from './NotificationMixin';

@Component
export default class CameraPermissionMixin extends Mixins(NotificationMixin) {
  permissionDialogVisibility = false;

  async checkMediaDevicesAllowance(context: string): Promise<boolean> {
    try {
      const cameraAvailability = await checkDevicesAvailability();

      if (!cameraAvailability) throw new Error(`[${context}]: Cannot find camera device`);

      const cameraPermission = await checkCameraPermission();

      if (cameraPermission === 'denied') throw new Error(`[${context}]: Check camera browser permissions`);

      this.permissionDialogVisibility = cameraPermission !== 'granted';

      if (context === 'SoraCard' && cameraPermission === 'granted') {
        return true;
      }
      // request to allow use camera
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (error) {
      console.error(error);

      this.showAppNotification(this.t('code.allowanceError'), context === 'QRcode' ? 'error' : undefined);

      return false;
    } finally {
      this.permissionDialogVisibility = false;
    }
  }
}
