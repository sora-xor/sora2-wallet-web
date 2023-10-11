<template>
  <div class="token-address">
    <span v-if="showName" class="token-address__name">{{ tokenName }}</span>
    <div class="token-address__value">
      (<formatted-address :value="tokenAddress" :symbols="10" :tooltip-text="t('assets.assetId')" v-bind="$attrs" />)
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import CopyAddressMixin from './mixins/CopyAddressMixin';
import TranslationMixin from './mixins/TranslationMixin';
import FormattedAddress from './shared/FormattedAddress.vue';

@Component({
  components: {
    FormattedAddress,
  },
})
export default class TokenAddress extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ default: '', type: String }) readonly name!: string;
  @Prop({ default: '', type: String }) readonly symbol!: string;
  @Prop({ default: '', type: String }) readonly address!: string;
  @Prop({ default: '', type: String }) readonly externalAddress!: string;
  @Prop({ default: false, type: Boolean }) readonly external!: boolean;
  @Prop({ default: true, type: Boolean }) readonly showName!: boolean;

  get tokenName(): string {
    return this.name || this.symbol;
  }

  get tokenAddress(): string {
    return this.external ? this.externalAddress : this.address;
  }
}
</script>

<style lang="scss" scoped>
.token-address {
  @include hint-text;

  &__name {
    margin-right: $basic-spacing-mini;
  }

  &__value {
    display: inline-flex;
    align-items: baseline;
  }
}
</style>
