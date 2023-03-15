import { Component, Mixins } from 'vue-property-decorator';
import type { MessageType } from 'element-ui/types/message';

import TranslationMixin from './TranslationMixin';
import { AppError } from '../../util';

@Component
export default class NotificationMixin extends Mixins(TranslationMixin) {
  defaultErrorMessage = 'unknownErrorText';

  ErrorMessages = [
    ['Invalid decoded address', 'walletSend.errorAddress'],
    ['Invalid bip39 mnemonic specified', 'desktop.errorMessages.mnemonic'],
    ['Unable to decode using the supplied passphrase', 'desktop.errorMessages.password'],
  ];

  getErrorMessage(error: unknown) {
    if (error instanceof AppError) {
      return this.t(error.key, error.payload);
    }
    if (error instanceof Error) {
      const errorMessage = error.message;

      if (this.te(errorMessage)) {
        return this.t(errorMessage);
      }

      const supportedMessage = this.ErrorMessages.find(([message]) => errorMessage.includes(message));

      if (supportedMessage) {
        return this.t(supportedMessage[1]);
      }
    }

    console.error(error);

    return this.t(this.defaultErrorMessage);
  }

  showAppAlert(message: string, title = ''): void {
    this.$alert(message, title);
  }

  showAppNotification(message: string, type?: MessageType): void {
    this.$notify({
      message,
      type,
      title: '',
    });
  }

  async withAppNotification(func: AsyncFnWithoutArgs, throwable = false): Promise<void> {
    try {
      await func();
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.showAppNotification(message, 'error');
      if (throwable) throw error;
    }
  }

  async withAppAlert(func: AsyncFnWithoutArgs, throwable = false): Promise<void> {
    try {
      await func();
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.showAppAlert(message, this.t('errorText'));
      if (throwable) throw error;
    }
  }
}
