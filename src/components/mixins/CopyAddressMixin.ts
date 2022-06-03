import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './TranslationMixin';
import { copyToClipboard, delay } from '../../util';

@Component
export default class CopyAddressMixin extends Mixins(TranslationMixin) {
  targetElement: Nullable<EventTarget> = null;
  wasAddressCopied = false;

  async handleCopyAddress(address: string, event?: PointerEvent): Promise<void> {
    if (event) {
      event.stopImmediatePropagation();
      this.targetElement = event.target;
      if (this.targetElement) {
        this.targetElement.addEventListener('mouseleave', this.handleMouseleaveListener);
      }
    }
    await copyToClipboard(address);
    this.wasAddressCopied = true;
    await delay(1000);
  }

  async handleMouseleaveListener(): Promise<void> {
    await delay(1000);
    this.wasAddressCopied = false;
    if (this.targetElement) {
      this.targetElement.removeEventListener('mouseleave', this.handleMouseleaveListener);
    }
  }

  copyTooltip(tooltipCopyValue?: string): string {
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    if (!this.wasAddressCopied) {
      return tooltipCopyValue ? this.t('copyWithValue', { value: tooltipCopyValue }) : this.t('assets.receive');
    }
    return tooltipCopyValue ? this.t('copiedWithValue', { value: tooltipCopyValue }) : this.t('assets.copied');
  }
}
