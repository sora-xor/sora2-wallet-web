<template>
  <div class="info-line-container">
    <info-line
      class="wallet-fee"
      is-formatted
      :label="t('networkFeeText')"
      :label-tooltip="t('networkFeeTooltipText')"
      :value="formattedValue"
      :asset-symbol="xor"
      :fiat-value="formattedFiatValue"
    />
  </div>
</template>

<script lang="ts">
import { FPNumber } from '@sora-substrate/sdk';
import { XOR } from '@sora-substrate/sdk/build/assets/consts';
import { Component, Mixins, Prop } from 'vue-property-decorator';

import InfoLine from './InfoLine.vue';
import FormattedAmountMixin from './mixins/FormattedAmountMixin';
import TranslationMixin from './mixins/TranslationMixin';

function isFPNumber(value: unknown): boolean {
  if (value instanceof FPNumber) {
    return true;
  }
  throw new Error('[WalletFee.vue]: property "value" should have FPNumber type');
}

@Component({
  components: {
    InfoLine,
  },
})
export default class WalletFee extends Mixins(TranslationMixin, FormattedAmountMixin) {
  @Prop({ required: true, validator: isFPNumber }) readonly value!: FPNumber;

  get xor(): string {
    return XOR.symbol;
  }

  private formatValue(value: FPNumber): string {
    return value.isFinity() ? value.toLocaleString() : value.toString();
  }

  get formattedValue(): string {
    return this.formatValue(this.value);
  }

  get formattedFiatValue(): Nullable<string> {
    const value = this.getFPNumberFiatAmountByFPNumber(this.value);
    if (!value) {
      return value;
    }
    return this.formatValue(value);
  }
}
</script>
