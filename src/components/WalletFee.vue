<template>
  <div class="info-line-container">
    <info-line
      class="wallet-fee"
      :label="t('walletSend.fee')"
      :label-tooltip="t('walletSend.feeTooltip')"
      :value="value.toLocaleString()"
      :asset-symbol="KnownSymbols.XOR"
      :fiat-value="getFiatAmountByFPNumber(value)"
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
  readonly KnownSymbols = KnownSymbols

  @Prop({ default: FPNumber.ZERO, type: FPNumber }) readonly value!: FPNumber
}
</script>
