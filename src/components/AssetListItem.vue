<template>
  <div
    :class="['s-flex', 'asset', { 'asset--with-fiat': withFiat }]"
    v-bind="$attrs"
    v-button="withTabindex"
    :tabindex="withTabindex ? 0 : -1"
    v-on="$listeners"
  >
    <token-logo size="big" :token="asset" :with-clickable-logo="withClickableLogo" @click.native="handleIconClick" />
    <div class="asset-description s-flex">
      <slot name="value" v-bind="asset">
        <div class="asset-symbol">{{ asset.symbol }}</div>
      </slot>
      <span v-if="asset.isSBT && showExpiry" class="asset-sbt-expiration">{{ sbtExpiryDate }}</span>
      <token-address :name="asset.name" :symbol="asset.symbol" :address="asset.address" class="asset-info" />
      <slot name="append" v-bind="asset" />
    </div>
    <slot v-bind="asset" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../api';
import { state } from '../store/decorators';

import NftTokenLogo from './AssetLogos/NftTokenLogo.vue';
import TokenLogo from './AssetLogos/TokenLogo.vue';
import TranslationMixin from './mixins/TranslationMixin';
import TokenAddress from './TokenAddress.vue';

import type { Asset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    NftTokenLogo,
    TokenLogo,
    TokenAddress,
  },
})
export default class AssetListItem extends Mixins(TranslationMixin) {
  @Prop({ required: true, type: Object }) readonly asset!: Asset;
  @Prop({ default: false, type: Boolean }) readonly withClickableLogo!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withFiat!: boolean;
  @Prop({ default: false, type: Boolean }) readonly withTabindex!: boolean;
  @Prop({ default: false, type: Boolean }) readonly showExpiry!: boolean;

  @state.account.address private connected!: string;

  sbtExpiryDate = '';

  get isSBT(): boolean {
    // @ts-expect-error typing
    return this.asset.isSBT;
  }

  async getSbtExpiryDate() {
    const sbtExpiryDate = await api.extendedAssets.getSbtExpiration(this.connected, this.asset.address);
    if (Number(sbtExpiryDate) === Infinity) {
      this.sbtExpiryDate = 'open-ended';
      return;
    }
    this.sbtExpiryDate = this.formatDate(Number(sbtExpiryDate), 'll');
  }

  handleIconClick(event: Event): void {
    if (!this.withClickableLogo) {
      return;
    }
    if (event) {
      event.stopImmediatePropagation();
    }
    this.$emit('show-details', this.asset);
  }

  async created(): Promise<void> {
    if (this.isSBT) await this.getSbtExpiryDate();
  }
}
</script>

<style lang="scss">
.asset-description {
  .formatted-amount__container {
    width: 100%;
  }
}
</style>

<style lang="scss" scoped>
.asset {
  align-items: center;
  height: var(--s-asset-item-height);
  position: relative;
  width: 100%;

  &--with-fiat {
    height: var(--s-asset-item-height--fiat);
  }

  &-description {
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    line-height: var(--s-line-height-big);
    padding: 0 var(--s-basic-spacing);
    width: 30%;
  }

  &-symbol {
    font-size: var(--s-font-size-big);
    font-weight: 600;
    letter-spacing: var(--s-letter-spacing-small);
    line-height: var(--s-line-height-extra-small);
  }

  &-sbt-expiration {
    display: block;
    margin-bottom: -8px !important;
    font-size: 11px;
    font-weight: 300;
    margin: 0;
  }
}
</style>
