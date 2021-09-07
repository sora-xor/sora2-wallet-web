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

@Component({
  components: {
    InfoLine
  }
})
export default class WalletFee extends Mixins(TranslationMixin, FormattedAmountMixin) {
  @Prop({ default: FPNumber.ZERO, type: FPNumber }) readonly value!: FPNumber

  get xor (): string {
    return KnownSymbols.XOR
  }

  get formattedValue (): string {
    return this.value.toLocaleString()
  }

  get formattedFiatValue (): Nullable<string> {
    return this.getFiatAmountByFPNumber(this.value)
  }
}
</script>
