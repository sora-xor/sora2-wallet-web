<template>
  <div class="formatted-amount__container">
    <formatted-amount
      :class="valueClass"
      :value="value"
      :font-size-rate="fontSizeRate"
      :font-weight-rate="fontWeightRate"
      :asset-symbol="assetSymbol"
      :symbol-as-decimal="symbolAsDecimal"
    >
      <slot />
    </formatted-amount>
    <formatted-amount
      v-if="hasFiatValue"
      is-fiat-value
      :value="fiatValue"
      :font-size-rate="fiatFormatAsValue ? fontSizeRate : fiatFontSizeRate"
      :font-weight-rate="fiatFormatAsValue ? fontWeightRate : fiatFontWeightRate"
      :with-left-shift="withLeftShift"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { FontSizeRate, FontWeightRate } from '../types'
import FormattedAmount from './FormattedAmount.vue'

@Component({
  components: {
    FormattedAmount
  }
})
export default class FormattedAmountWithFiatValue extends Vue {
  @Prop({ default: '', type: String }) readonly valueClass?: string
  @Prop({ default: '', type: String }) readonly value!: string
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fontSizeRate?: string
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fontWeightRate?: string
  @Prop({ default: '', type: String }) readonly assetSymbol?: string
  @Prop({ default: false, type: Boolean }) readonly symbolAsDecimal?: boolean
  @Prop({ default: false, type: Boolean }) readonly integerOnly?: boolean
  @Prop({ default: true, type: Boolean }) readonly hasFiatValue?: boolean
  @Prop({ default: '', type: String }) readonly fiatValue?: string
  @Prop({ default: false, type: Boolean }) readonly fiatFormatAsValue?: boolean
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fiatFontSizeRate?: string
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fiatFontWeightRate?: string
  @Prop({ default: false, type: Boolean }) readonly withLeftShift?: boolean
}
</script>

<style scoped lang="scss">
.formatted-amount__container {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  flex-wrap: wrap;
  word-break: break-word;
  text-align: right;
}
</style>
