<template>
  <div class="formatted-amount__container">
    <formatted-amount
      :class="valueClass"
      :value="value"
      :font-size-rate="fontSizeRate"
      :font-weight-rate="fontWeightRate"
      :asset-symbol="assetSymbol"
      :symbol-as-decimal="symbolAsDecimal"
      :value-can-be-hidden="valueCanBeHidden"
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
      :value-can-be-hidden="valueCanBeHidden"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { FontSizeRate, FontWeightRate } from '../consts';
import FormattedAmount from './FormattedAmount.vue';

@Component({
  components: {
    FormattedAmount,
  },
})
export default class FormattedAmountWithFiatValue extends Vue {
  /**
   * Amount value's custom class.
   */
  @Prop({ default: '', type: String }) readonly valueClass!: string;
  /**
   * Balance or Amount value.
   */
  @Prop({ default: '', type: String }) readonly value!: string;
  /**
   * Amount value's Font size rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font sizes for both numbers' parts.
   */
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fontSizeRate!: string;
  /**
   * Amount value's Font weight rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font weights for both numbers' parts.
   */
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fontWeightRate!: string;
  /**
   * Amount value's asset symbol.
   */
  @Prop({ default: '', type: String }) readonly assetSymbol!: string;
  /**
   * Font size of asset symbol is the same with decimal part size for Amount value.
   * Symbol value located inside formatted-amount__decimal container at the HTML structure.
   */
  @Prop({ default: false, type: Boolean }) readonly symbolAsDecimal!: boolean;
  /**
   * Sometimes presence of Fiat value related on some rules. With this setting we could show/hide Fiat value part.
   */
  @Prop({ default: true, type: Boolean }) readonly hasFiatValue!: boolean;
  /**
   * Fiat value.
   */
  @Prop({ default: '', type: String }) readonly fiatValue!: string;
  /**
   * We could set this flag to true if we have the same FontSizeRate and FontWeightRate with Amount value.
   */
  @Prop({ default: false, type: Boolean }) readonly fiatFormatAsValue!: boolean;
  /**
   * Define directly that this field displays value which can be hidden by hide balances button.
   */
  @Prop({ default: false, type: Boolean }) readonly valueCanBeHidden!: boolean;
  /**
   * Fiat value's Font size rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font sizes for both numbers' parts.
   */
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fiatFontSizeRate!: string;
  /**
   * Fiat value's Font weight rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font weights for both numbers' parts.
   */
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fiatFontWeightRate!: string;
  /**
   * Added special class to left shifting for Fiat value if needed (the shift is the same in all screens).
   */
  @Prop({ default: false, type: Boolean }) readonly withLeftShift!: boolean;
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
