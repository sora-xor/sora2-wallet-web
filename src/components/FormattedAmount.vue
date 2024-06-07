<template>
  <span
    v-if="value && isFiniteValue"
    :class="computedClasses"
    @mouseenter="checkWiderFlag"
    @mouseleave="resetWiderFlag"
    @touchstart="checkWiderFlag"
    @touchend="resetWiderFlag"
    ref="parent"
  >
    <span class="formatted-amount__value" ref="child">
      <span
        v-if="!isHiddenValue && (isFiatValue || $slots.prefix || customizableCurrency)"
        class="formatted-amount__prefix"
      >
        <slot name="prefix">{{ symbol }}</slot>
      </span>
      <span v-if="!isHiddenValue || (isHiddenValue && integerOnly)" class="formatted-amount__integer">{{
        isHiddenValue ? HiddenValue : formatted.integer
      }}</span>
      <span v-if="!integerOnly" class="formatted-amount__decimal">
        <span class="formatted-amount__decimal-value">{{ isHiddenValue ? HiddenValue : formatted.decimal }}</span>
        <span v-if="assetSymbol && symbolAsDecimal" class="formatted-amount__symbol">{{ assetSymbol }}</span>
      </span>
      <span v-if="assetSymbol && !symbolAsDecimal" class="formatted-amount__symbol">{{ assetSymbol }}</span>
      <slot />
    </span>
  </span>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/util';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { Currency, FiatExchangeRateObject } from '@/types/currency';

import { FontSizeRate, FontWeightRate, HiddenValue } from '../consts';
import { DaiCurrency } from '../consts/currencies';
import { state, getter } from '../store/decorators';
import { getCurrency } from '../util';

import NumberFormatterMixin from './mixins/NumberFormatterMixin';

interface FormattedAmountValues {
  integer: string;
  decimal: string;
}

@Component
export default class FormattedAmount extends Mixins(NumberFormatterMixin) {
  readonly HiddenValue = HiddenValue;
  /**
   * Balance or Amount value.
   */
  @Prop({ default: '', type: String }) readonly value!: string;
  /**
   * Font size rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font sizes for both numbers' parts.
   */
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fontSizeRate!: string;
  /**
   * Font weight rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font weights for both numbers' parts.
   */
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fontWeightRate!: string;
  /**
   * Amount value's asset symbol.
   */
  @Prop({ default: '', type: String }) readonly assetSymbol!: string;
  /**
   * Font size of asset symbol is the same with decimal part size.
   * Symbol value located inside formatted-amount__decimal container at the HTML structure.
   */
  @Prop({ default: false, type: Boolean }) readonly symbolAsDecimal!: boolean;
  /**
   * Adds special class and styles to formatted number to convert in to Fiat value.
   */
  @Prop({ default: false, type: Boolean }) readonly isFiatValue!: boolean;
  /**
   * Uses default rounding rule for fiat value. It'll be applied for small numbers like 0.009 or less
   */
  @Prop({ default: false, type: Boolean }) readonly fiatDefaultRounding!: boolean;
  /**
   * Define directly that this field displays value which can be hidden by hide balances button.
   */
  @Prop({ default: false, type: Boolean }) readonly valueCanBeHidden!: boolean;
  /**
   * Fills only intger part if we don't need decimals value.
   */
  @Prop({ default: false, type: Boolean }) readonly integerOnly!: boolean;
  /**
   * Added special class to left shifting for Fiat value if needed (the shift is the same in all screens).
   */
  @Prop({ default: false, type: Boolean }) readonly withLeftShift!: boolean;
  /**
   * Allows for getting proper exchange rate and symbol for provided currency
   */
  @Prop({ default: '', type: String }) readonly customizableCurrency!: Currency | '';

  @state.settings.shouldBalanceBeHidden shouldBalanceBeHidden!: boolean;
  @state.settings.currency currency!: Currency;
  @state.settings.fiatExchangeRateObject fiatExchangeRateObject!: FiatExchangeRateObject;

  @getter.settings.currencySymbol private currencySymbol!: string;
  @getter.settings.exchangeRate private exchangeRate!: number;

  isValueWider = false;

  get symbol(): string {
    // if provided by prop, use prop, otherwise, use commonly defined currency
    if (this.customizableCurrency) {
      return getCurrency(this.customizableCurrency)?.symbol ?? DaiCurrency.symbol;
    }
    return this.currencySymbol;
  }

  private formatFiatDecimal(integer: Nullable<string>, decimal: Nullable<string>): string {
    if (!decimal || !+decimal) {
      return '00';
    }
    if (decimal.length <= 2) {
      return decimal.length === 1 ? decimal + '0' : decimal;
    }
    const isSmallNumber = (!integer || !+integer) && decimal.startsWith('00');
    if (isSmallNumber && this.fiatDefaultRounding) {
      return decimal;
    }
    return decimal.length === 1 ? decimal + '0' : decimal.substring(0, 2);
  }

  get unformatted(): string {
    return this.value
      .replaceAll(FPNumber.DELIMITERS_CONFIG.thousand, '')
      .replace(FPNumber.DELIMITERS_CONFIG.decimal, '.');
  }

  get isFiniteValue(): boolean {
    if (+this.value !== Infinity) {
      return Number.isFinite(+this.unformatted);
    }
    return false;
  }

  get formatted(): FormattedAmountValues {
    let value = this.value;

    if (this.isFiatValue) {
      const coefficient = this.customizableCurrency
        ? this.fiatExchangeRateObject[this.customizableCurrency] ?? 1
        : this.exchangeRate;
      value = new FPNumber(this.unformatted).mul(coefficient).toLocaleString();
    }

    let [integer, decimal] = value.split(FPNumber.DELIMITERS_CONFIG.decimal);

    if (!this.integerOnly) {
      if (this.isFiatValue) {
        decimal = this.formatFiatDecimal(integer, decimal);
      }

      if (decimal && decimal.length > 0) {
        decimal = FPNumber.DELIMITERS_CONFIG.decimal + decimal;
      }
    }

    return {
      integer,
      decimal,
    };
  }

  get isHiddenValue(): boolean {
    return this.valueCanBeHidden && this.shouldBalanceBeHidden;
  }

  get computedClasses(): string {
    const baseClass = 'formatted-amount';
    const classes = [baseClass];

    if (this.fontSizeRate !== FontSizeRate.NORMAL) {
      classes.push(`${baseClass}--font-size-${this.fontSizeRate}`);
    }

    if (this.fontWeightRate !== FontWeightRate.NORMAL) {
      classes.push(`${baseClass}--font-weight-${this.fontWeightRate}`);
    }

    if (this.assetSymbol && this.symbolAsDecimal) {
      classes.push(`${baseClass}--symbol-as-decimal`);
    }

    if (this.isFiatValue) {
      classes.push(`${baseClass}--fiat-value`);
    }

    if (this.withLeftShift) {
      classes.push(`${baseClass}--shifted`);
    }

    if (this.isValueWider) {
      classes.push(`${baseClass}--value-wider`);
    }

    return classes.join(' ');
  }

  /**
   * If the child element is wider that parent container, update isValueWider property
   * Note: parent had overflow style
   */
  checkWiderFlag(): void {
    const { parent, child } = this.$refs;
    const { offsetWidth: parentWidth } = parent as HTMLSpanElement;
    const { offsetWidth: childWidth } = child as HTMLSpanElement;

    if (childWidth > parentWidth) {
      this.isValueWider = true;
    }
  }

  resetWiderFlag(): void {
    this.isValueWider = false;
  }
}
</script>

<style scoped lang="scss">
$formatted-amount-class: '.formatted-amount';

#{$formatted-amount-class} {
  display: block;
  overflow-wrap: anywhere;
  word-break: break-all;
  // Trick to fix horizontal spacings bug between elements
  &__value {
    display: flex;
    align-items: baseline;
    // NOTE: use left-to-right texting direction including arabic langs; remove it if support is needed.
    unicode-bidi: bidi-override;
    direction: ltr;
  }
  &--fiat-value {
    color: var(--s-color-fiat-value);
    font-family: var(--s-font-family-default);
    font-weight: 400;
    line-height: var(--s-line-height-medium);
    letter-spacing: var(--s-letter-spacing-small);
  }
  &--symbol-as-decimal {
    #{$formatted-amount-class}__symbol {
      margin-left: $basic-spacing-mini;
    }
  }
  #{$formatted-amount-class}__decimal:not(:last-child) {
    margin-right: $basic-spacing-mini;
  }
  #{$formatted-amount-class}__symbol {
    white-space: nowrap;
  }
  &--font-size {
    &-medium {
      #{$formatted-amount-class}__decimal {
        font-size: 0.875em;
      }
    }
    &-small {
      #{$formatted-amount-class}__decimal {
        font-size: 0.777em;
      }
    }
  }
  &--font-weight {
    &-medium {
      #{$formatted-amount-class}__prefix {
        font-weight: 800;
      }
      #{$formatted-amount-class}__integer {
        font-weight: 600;
      }
      #{$formatted-amount-class}__decimal {
        font-weight: 300;
      }
    }
    &-small {
      &:not(#{$formatted-amount-class}--fiat-value) {
        font-weight: 400;
        font-size: var(--s-font-size-extra-small);
        #{$formatted-amount-class}__integer,
        #{$formatted-amount-class}__symbol {
          font-weight: 600;
        }
      }
    }
  }
  &--shifted {
    margin-left: $basic-spacing-mini;
  }
  &__prefix {
    opacity: 0.6;
    padding-right: #{$basic-spacing-extra-mini};
  }
}
</style>
