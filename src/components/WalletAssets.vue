<template>
  <div class="wallet-assets s-flex">
    <template v-if="!!assets.length">
      <template v-for="(asset, index) in assets">
        <div class="wallet-assets-item s-flex" :key="asset.symbol">
          <i :class="getAssetClasses(asset.symbol)" />
          <div class="amount s-flex">
            <div class="amount-value">{{ formatAmount(asset) }}</div>
            <div class="amount-converted">{{ formatConvertedAmount(asset) }}</div>
          </div>
          <!-- TODO: Add Send Button here -->
          <s-button
            class="swap"
            type="primary"
            size="small"
            icon="swap"
            icon-position="right"
            @click="handleAssetSwap(asset)"
          >
            {{ t('assets.swap') }}
          </s-button>
          <s-button class="details" type="link" @click="handleOpenAssetDetails(asset.symbol)">
            <s-icon name="chevron-right" size="12px" />
          </s-button>
        </div>
        <s-divider v-if="index !== assets.length - 1" :key="`${asset.symbol}-divider`" />
      </template>
    </template>
    <div v-else class="wallet-assets-empty">{{ t('assets.empty') }}</div>
    <s-button class="wallet-assets-add" type="tertiary" @click="handleOpenAddToken">{{ t('assets.add') }}</s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { RouteNames } from '../consts'
import { getTokenIconClasses } from '../util'
import { AccountAsset } from '@sora-substrate/util'

@Component
export default class WalletAssets extends Mixins(TranslationMixin) {
  @Getter assets!: Array<AccountAsset>
  @Action getAccountAssets
  @Action navigate

  mounted (): void {
    this.getAccountAssets()
  }

  getAssetClasses (symbol: string): string {
    return getTokenIconClasses(symbol)
  }

  formatAmount (asset: AccountAsset): string {
    return `${asset.balance} ${asset.symbol}`
  }

  formatConvertedAmount (asset: any): string {
    return `$${asset.usdBalance} USD`
  }

  handleAssetSwap (asset: any): void {
    this.$emit('swap', asset)
  }

  handleOpenAssetDetails (symbol: string): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { symbol } })
  }

  handleOpenAddToken (): void {
    this.navigate({ name: RouteNames.AddToken })
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

.wallet-assets {
  flex-direction: column;
  > :first-child {
    margin-top: $basic-spacing;
  }
  &-item {
    align-items: center;
    .amount {
      flex: 1;
      flex-direction: column;
      &-converted {
        @include hint-text;
      }
    }
    .details {
      padding: 0;
    }
    .token-logo {
      margin-right: $basic-spacing;
      @include token-logo-styles;
    }
  }
  &-add {
    margin-top: $basic-spacing;
  }
  &-empty {
    text-align: center;
    @include hint-text;
  }
  @include icon-chevron-right;
}
</style>
