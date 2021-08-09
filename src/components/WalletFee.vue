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
    <formatted-amount-with-fiat-value
      :value="value.toLocaleString()"
      :font-size-rate="FontSizeRate.MEDIUM"
      :font-weight-rate="FontWeightRate.SMALL"
      :asset-symbol="KnownSymbols.XOR"
      :fiat-value="getFiatAmountByFPNumber(value)"
      :fiat-font-size-rate="FontSizeRate.MEDIUM"
      with-left-shift
    />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { FPNumber, KnownSymbols } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import FormattedAmountMixin from './mixins/FormattedAmountMixin'
import FormattedAmountWithFiatValue from './FormattedAmountWithFiatValue.vue'
import { FontSizeRate, FontWeightRate } from '../types'

@Component({
  components: {
    FormattedAmountWithFiatValue
  }
})
export default class WalletFee extends Mixins(TranslationMixin, FormattedAmountMixin) {
  readonly KnownSymbols = KnownSymbols
  readonly FontSizeRate = FontSizeRate
  readonly FontWeightRate = FontWeightRate

  @Prop({ default: FPNumber.ZERO, type: FPNumber }) readonly value!: FPNumber
}
</script>

<style lang="scss">
.wallet-fee .formatted-amount {
  &__container {
    margin-left: auto;
  }
}
</style>

<style scoped lang="scss">
.wallet-fee {
  align-items: baseline;
  margin-top: calc(var(--s-basic-spacing) * 2);
  width: 100%;
  padding-right: var(--s-basic-spacing);
  padding-left: var(--s-basic-spacing);
  font-size: var(--s-font-size-extra-small);
  color: var(--s-color-base-content-primary);
  border-bottom: 1px solid var(--s-color-base-border-secondary);
  &__label {
    font-weight: 300;
    margin-right: var(--s-basic-spacing);
    text-transform: uppercase;
  }
  .el-tooltip {
    margin-right: var(--s-basic-spacing);
    align-self: center;
  }
}
</style>
