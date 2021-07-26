<template>
  <div class="wallet-fee s-flex">
    <span class="wallet-fee__label">{{ t('walletSend.fee') }}</span>
    <s-tooltip
      popper-class="info-tooltip info-tooltip--info-line"
      :content="t('walletSend.feeTooltip')"
      placement="right-start"
      border-radius="mini"
    >
      <s-icon name="info-16" size="14px" />
    </s-tooltip>
    <formatted-amount
      class="wallet-fee__value"
      :value="fee.toLocaleString()"
      :font-size-rate="FontSizeRate.MEDIUM"
      :font-weight-rate="FontWeightRate.SMALL"
    >
      <template v-slot="{ decimal }">{{ decimal }} <span class="formatted-amount__symbol">{{ KnownSymbols.XOR }}</span></template>
    </formatted-amount>
    <formatted-amount
      v-if="hasFiatValue"
      :value="getFiatAmountByFPNumber(fee)"
      is-fiat-value
      :font-size-rate="FontSizeRate.MEDIUM"
      with-left-shift
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { FPNumber, KnownSymbols } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import FormattedAmountMixin from './mixins/FormattedAmountMixin'
import FormattedAmount from './FormattedAmount.vue'
import { FontSizeRate, FontWeightRate } from '../types'

@Component({
  components: {
    FormattedAmount
  }
})
export default class WalletFee extends Mixins(TranslationMixin, FormattedAmountMixin) {
  readonly KnownSymbols = KnownSymbols
  readonly FontSizeRate = FontSizeRate
  readonly FontWeightRate = FontWeightRate

  @Prop({ default: FPNumber.ZERO, type: FPNumber }) readonly fee!: FPNumber
  @Prop({ default: false, type: Boolean }) readonly hasFiatValue?: boolean
}
</script>

<style lang="scss">
$formatted-amount-class: '.formatted-amount';

.wallet-fee__value {
  margin-left: auto;
}
</style>

<style scoped lang="scss">
.wallet-fee {
  align-items: center;
  margin-top: calc(var(--s-basic-spacing) * 2);
  width: 100%;
  padding-right: var(--s-basic-spacing);
  padding-left: var(--s-basic-spacing);
  color: var(--s-color-base-content-primary);
  border-bottom: 1px solid var(--s-color-base-border-secondary);
  &__label {
    margin-right: var(--s-basic-spacing);
    text-transform: uppercase;
  }
  .el-tooltip {
    margin-right: var(--s-basic-spacing);
  }
}
</style>
