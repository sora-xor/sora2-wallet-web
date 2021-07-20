import { Component, Mixins } from 'vue-property-decorator'

import TranslationMixin from '../mixins/TranslationMixin'
import { copyToClipboard, delay } from '../../util'

@Component
export default class CopyAddressMixin extends Mixins(TranslationMixin) {
  wasAddressCopied = false

  async handleCopyAddress (address: string, event?: Event): Promise<void> {
    event && event.stopImmediatePropagation()
    await copyToClipboard(address)
    this.wasAddressCopied = true
    await delay(1000)
    this.wasAddressCopied = false
  }

  get copyTooltip (): string {
    // TODO: [UI-LIB] add key property with the content value for tooltip in buttons to rerender it each time
    return this.t(`assets.${!this.wasAddressCopied ? 'receive' : 'copied'}`)
  }
}
