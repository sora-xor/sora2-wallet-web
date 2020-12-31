<template>
  <div class="wallet-assets s-flex" v-loading="loading">
    <template v-if="!!accountAssets.length">
      <template v-for="(asset, index) in accountAssets">
        <div class="wallet-assets-item s-flex" :key="asset.symbol">
          <i :class="getAssetClasses(asset.symbol)" />
          <div class="amount s-flex">
            <div class="amount-value">{{ formatAmount(asset) }}</div>
            <!-- TODO: coming soon <div class="amount-converted">{{ formatConvertedAmount(asset) }}</div> -->
          </div>
          <s-button
            class="swap"
            type="primary"
            size="small"
            icon="arrow-top-right-rounded"
            icon-position="right"
            :disabled="isZeroBalance(asset)"
            @click="handleAssetSend(asset)"
          >
            {{ t('assets.send') }}
          </s-button>
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
        <s-divider v-if="index !== accountAssets.length - 1" :key="`${asset.symbol}-divider`" />
      </template>
    </template>
    <div v-else class="wallet-assets-empty">{{ t('assets.empty') }}</div>
    <s-button class="wallet-assets-add" type="tertiary" @click="handleOpenAddAsset">{{ t('assets.add') }}</s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { AccountAsset, FPNumber, KnownSymbols } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import { RouteNames } from '../consts'
import { getAssetIconClasses } from '../util'

@Component
export default class WalletAssets extends Mixins(TranslationMixin, LoadingMixin) {
  @Getter accountAssets!: Array<AccountAsset>
  @Action getAccountAssets
  @Action navigate

  async mounted (): Promise<void> {
    this.withApi(this.getAccountAssets)
  }

  getAssetClasses (symbol: string): string {
    return getAssetIconClasses(symbol)
  }

  formatAmount (asset: AccountAsset): string {
    return `${asset.balance} ${asset.symbol === KnownSymbols.USD ? 'USDT' : asset.symbol}`
  }

  isZeroBalance (asset: AccountAsset): boolean {
    return new FPNumber(asset.balance, asset.decimals).isZero()
  }

  formatConvertedAmount (asset: AccountAsset): string {
    return '- USD'
  }

  handleAssetSwap (asset: AccountAsset): void {
    this.$emit('swap', asset)
  }

  handleAssetSend (asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletSend, params: { asset } })
  }

  handleOpenAssetDetails (symbol: string): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { symbol } })
  }

  handleOpenAddAsset (): void {
    this.navigate({ name: RouteNames.AddAsset })
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
      overflow-wrap: break-word;
      flex-direction: column;
      padding-right: $basic-spacing_small;
      padding-left: $basic-spacing_mini;
      width: 30%;
      &-converted {
        @include hint-text;
      }
    }
    .details {
      padding: 0;
    }
    .asset-logo {
      flex-shrink: 0;
      @include asset-logo-styles;
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
