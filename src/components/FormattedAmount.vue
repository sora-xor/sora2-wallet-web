<template>
  <span v-if="value && isFiniteValue" :class="computedClasses">
    <span v-if="isFiatValue" class="formatted-amount__prefix">~$</span>
    <span class="formatted-amount__integer">{{ formatted.integer }}</span>
    <span v-if="!integerOnly" class="formatted-amount__decimal">
      <span class="formatted-amount__decimal-value">{{ formatted.decimal }}</span>
      <span v-if="assetSymbol && symbolAsDecimal" class="formatted-amount__symbol">{{ assetSymbol }}</span>
    </span>
    <span v-if="assetSymbol && !symbolAsDecimal" class="formatted-amount__symbol">{{ assetSymbol }}</span>
    <slot />
  </span>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { FPNumber } from '@sora-substrate/util'

import { FontSizeRate, FontWeightRate } from '../types'
import NumberFormatterMixin from './mixins/NumberFormatterMixin'

interface FormattedAmountValues {
  integer: string;
  decimal: string;
}

@Component
export default class FormattedAmount extends Mixins(NumberFormatterMixin) {
  @Prop({ default: '', type: String }) readonly value!: string
  /**
   * Font size rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font sizes for both numbers' parts.
   */
  @Prop({ default: FontSizeRate.NORMAL, type: String }) readonly fontSizeRate?: string
  /**
   * Font weight rate between integer and decimal numbers' parts. Possible values: `"small"`, `"medium"`, `"normal"`.
   * By default it's set to `"normal"` and it means the same font weights for both numbers' parts.
   */
  @Prop({ default: FontWeightRate.NORMAL, type: String }) readonly fontWeightRate?: string
  @Prop({ default: '', type: String }) readonly assetSymbol?: string
  @Prop({ default: false, type: Boolean }) readonly symbolAsDecimal?: boolean
  @Prop({ default: false, type: Boolean }) readonly isFiatValue?: boolean
  @Prop({ default: false, type: Boolean }) readonly integerOnly?: boolean
  @Prop({ default: false, type: Boolean }) readonly withLeftShift?: boolean

  get unformatted (): string {
    return this.value
      .replace(new RegExp(FPNumber.DELIMITERS_CONFIG.thousand, 'g'), '')
      .replace(FPNumber.DELIMITERS_CONFIG.decimal, '.')
  }

  get isFiniteValue (): boolean {
    if (+this.value !== Infinity) {
      return Number.isFinite(+this.unformatted)
    }
    return false
  }

  get formatted (): FormattedAmountValues {
    let [integer, decimal] = this.value.split(FPNumber.DELIMITERS_CONFIG.decimal)

    if (!this.integerOnly) {
      if (this.isFiatValue) {
        if (decimal) {
          decimal = decimal.length === 1 ? decimal + '0' : decimal.substring(0, 2)
        } else {
          decimal = '00'
        }
      }

      if (decimal && decimal.length > 0) {
        decimal = FPNumber.DELIMITERS_CONFIG.decimal + decimal
      }
    }

    return {
      integer,
      decimal
    }
  }

  get computedClasses (): string {
    const baseClass = 'formatted-amount'
    const classes = [baseClass]

    if (this.fontSizeRate !== FontSizeRate.NORMAL) {
      classes.push(`${baseClass}--font-size-${this.fontSizeRate}`)
    }

    if (this.fontWeightRate !== FontWeightRate.NORMAL) {
      classes.push(`${baseClass}--font-weight-${this.fontWeightRate}`)
    }

    if (this.assetSymbol && this.symbolAsDecimal) {
      classes.push(`${baseClass}--symbol-as-decimal`)
    }

    if (this.isFiatValue) {
      classes.push(`${baseClass}--fiat-value`)
    }

    if (this.withLeftShift) {
      classes.push(`${baseClass}--shifted`)
    }

    return classes.join(' ')
  }
}
</script>

<style scoped lang="scss">
$formatted-amount-class: '.formatted-amount';

#{$formatted-amount-class} {
  display: inline-flex;
  align-items: baseline;
  &--fiat-value {
    color: var(--s-color-fiat-value);
    font-family: var(--s-font-family-default);
    font-weight: 400;
    line-height: var(--s-line-height-medium);
    letter-spacing: var(--s-letter-spacing-small);
    display: inline-flex;
    align-items: baseline;
    white-space: nowrap;
  }
  &--symbol-as-decimal {
    #{$formatted-amount-class}__decimal-value {
      margin-right: $basic-spacing-mini;
    }
  }
  #{$formatted-amount-class}__decimal + #{$formatted-amount-class}__symbol {
    margin-left: $basic-spacing-mini;
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
    opacity: .6;
    padding-right: calc(var(--s-basic-spacing) / 4);
  }
}
</style>
