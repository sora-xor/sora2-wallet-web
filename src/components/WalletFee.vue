<template>
  <div class="info-line-container">
    <info-line
      class="wallet-fee"
      :label="t('walletSend.fee')"
      :label-tooltip="t('walletSend.feeTooltip')"
      :value="formattedValue"
      :asset-symbol="xor"
      :fiat-value="formattedFiatValue"
      is-formatted
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { FPNumber, KnownSymbols } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import FormattedAmountMixin from './mixins/FormattedAmountMixin'
import InfoLine from './InfoLine.vue'

function isFPNumber (value: any): boolean {
  if (value instanceof FPNumber) {
    return true
  }
  throw new Error('[WalletFee.vue]: property "value" should have FPNumber type')
}

@Component({
  components: {
    InfoLine
  }
})
export default class WalletFee extends Mixins(TranslationMixin, FormattedAmountMixin) {
  @Prop({ required: true, validator: isFPNumber }) readonly value!: FPNumber

  get xor (): string {
    return KnownSymbols.XOR
  }

  private formatValue (value: FPNumber): string {
    return value.isFinity() ? value.toLocaleString() : value.toString()
  }

  get formattedValue (): string {
    return this.formatValue(this.value)
  }

  get formattedFiatValue (): Nullable<string> {
    const value = this.getFPNumberFiatAmountByFPNumber(this.value)
    if (!value) {
      return value
    }
    return this.formatValue(value)
  }
}
</script>
