import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './TranslationMixin';
import { copyToClipboard, delay } from '../../util';

// TODO: make a common solution without 'address' word and use it everywhere
@Component
export default class CopyAddressMixin extends Mixins(TranslationMixin) {
  targetElement: Nullable<EventTarget> = null;
  wasAddressCopied = false;
  tooltipCopyValue: Nullable<string> = null;

  async handleCopyAddress(address: string, event?: PointerEvent): Promise<void> {
    if (event) {
      event.stopImmediatePropagation();
      this.targetElement = event.target;
      this.targetElement?.addEventListener('mouseleave', this.handleMouseleaveListener);
    }
    await copyToClipboard(address);
    this.wasAddressCopied = true;
    await delay(1000);
  }

  async handleMouseleaveListener(): Promise<void> {
    await delay(1000);
    this.wasAddressCopied = false;
    this.targetElement?.removeEventListener('mouseleave', this.handleMouseleaveListener);
  }

  get copyTooltip(): string {
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    if (!this.wasAddressCopied) {
      return this.tooltipCopyValue
        ? this.t('copyWithValue', { value: this.tooltipCopyValue })
        : this.t('assets.receive');
    }
    return this.tooltipCopyValue
      ? this.t('copiedWithValue', { value: this.tooltipCopyValue })
      : this.t('assets.copied');
  }
}
