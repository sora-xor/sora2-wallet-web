<template>
  <span class="fiat-value" v-if="value">
    <span class="fiat-value__prefix">~$</span>
    <span class="fiat-value__number">{{ formatted.value }}</span>
    <span class="fiat-value__decimals">{{ formatted.decimals }}</span>
  </span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { FPNumber } from '@sora-substrate/util'

@Component
export default class FiatValue extends Vue {
  @Prop({ default: '', type: String }) readonly value!: string
  @Prop({ default: true, type: Boolean }) readonly withDecimals!: boolean

  get formatted (): any {
    const delimiterIndex = this.value.indexOf(FPNumber.DELIMITERS_CONFIG.decimal)
    if (this.withDecimals) {
      return {
        value: delimiterIndex !== -1 ? this.value.substring(0, delimiterIndex) : this.value,
        decimals: delimiterIndex !== -1 ? this.value.substring(delimiterIndex) : FPNumber.DELIMITERS_CONFIG.decimal + '00'
      }
    }
    return {
      value: delimiterIndex !== -1 ? this.value.substring(0, delimiterIndex) : this.value,
      decimals: ''
    }
  }
}
</script>

<style scoped lang="scss">
.fiat-value {
  color: var(--s-color-fiat-value);
  font-family: var(--s-font-family-default);
  font-weight: 800;
  font-size: var(--s-font-size-small);
  line-height: var(--s-line-height-medium);
  letter-spacing: var(--s-letter-spacing-small);
  &__prefix {
    opacity: .6;
    padding-right: calc(var(--s-basic-spacing) / 4);
  }
  &__number {
    font-weight: 600;
  }
  &__decimals {
    font-weight: 300;
    font-size: var(--s-font-size-mini);
  }
}
</style>
