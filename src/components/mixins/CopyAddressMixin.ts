import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './TranslationMixin';
import { copyToClipboard, delay } from '../../util';

// TODO: make a common solution without 'address' word and use it everywhere
@Component
export default class CopyAddressMixin extends Mixins(TranslationMixin) {
  wasAddressCopied = false;
  customCopyTooltip: Nullable<string> = null;
  customCopiedTooltip: Nullable<string> = null;

  async handleCopyAddress(address: string, event?: Event): Promise<void> {
    event && event.stopImmediatePropagation();
    await copyToClipboard(address);
    this.wasAddressCopied = true;
    await delay(1000);
    this.wasAddressCopied = false;
  }

  get copyTooltip(): string {
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    if (!this.wasAddressCopied) {
      return this.customCopyTooltip ?? this.t('assets.receive');
    }
    return this.customCopiedTooltip ?? this.t('assets.copied');
  }
}
