import { Vue, Component } from 'vue-property-decorator'

import { copyToClipboard, delay } from '../../util'

@Component
export default class CopyAddressMixin extends Vue {
  wasAddressCopied = false

  async handleCopyAddress (address: string, event?: Event): Promise<void> {
    event && event.stopImmediatePropagation()
    await copyToClipboard(address)
    this.wasAddressCopied = true
    await delay(1000)
    this.wasAddressCopied = false
  }
}
