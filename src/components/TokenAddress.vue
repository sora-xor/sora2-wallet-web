<template>
  <div class="token-address">
    <span v-if="showName" class="token-address__name">{{ tokenName }}</span>
    <s-tooltip :content="copyTooltip(t('assets.assetId'))" tabindex="-1">
      <span class="token-address__value" @click="handleCopyAddress(tokenAddress, $event)">
        ({{ formattedAddress }})
      </span>
    </s-tooltip>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';

import { formatAddress } from '../util';

@Component
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

  get formattedAddress(): string {
    return formatAddress(this.tokenAddress, 10);
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
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
