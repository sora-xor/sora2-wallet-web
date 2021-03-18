<template>
  <div class="wallet-assets s-flex" v-loading="loading">
    <template v-if="!!accountAssets.length">
      <template v-for="(asset, index) in namedAccountAssets">
        <div class="wallet-assets-item s-flex" :key="asset.symbol">
          <i :class="getAssetClasses(asset.symbol)" />
          <div class="asset s-flex">
            <div class="asset-value">{{ formatBalance(asset) }}</div>
            <div class="asset-info">{{ asset.name || asset.symbol }}
              <s-tooltip :content="t('assets.copy')">
                <span class="asset-id" @click="handleCopy(asset)">({{ getFormattedAddress(asset) }})</span>
              </s-tooltip>
            </div>
            <!-- TODO: coming soon <div class="amount-converted">{{ formatConvertedAmount(asset) }}</div> -->
          </div>
          <s-button
            v-if="permissions.sendAssets"
            class="swap"
            type="primary"
            size="small"
            icon="arrow-top-right-rounded"
            :tooltip="t('assets.send')"
            :disabled="isZeroBalance(asset)"
            @click="handleAssetSend(asset)"
          />
          <s-button
            v-if="permissions.swapAssets"
            class="swap"
            type="primary"
            size="small"
            icon="swap"
            :tooltip="t('assets.swap')"
            @click="handleAssetSwap(asset)"
          />
          <s-button class="details" type="link" @click="handleOpenAssetDetails(asset)">
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
import { AccountAsset, KnownAssets } from '@sora-substrate/util'

import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import { RouteNames } from '../consts'
import { getAssetIconClasses, formatAddress, copyToClipboard } from '../util'
import { NamedAccountAsset } from '@/types'

@Component
export default class WalletAssets extends Mixins(TranslationMixin, LoadingMixin, NumberFormatterMixin) {
  @Getter accountAssets!: Array<AccountAsset>
  @Getter permissions
  @Action getAccountAssets
  @Action navigate

  async mounted (): Promise<void> {
    this.withApi(this.getAccountAssets)
  }

  get namedAccountAssets (): Array<NamedAccountAsset> {
    return this.accountAssets.map(asset => {
      const knownAsset = KnownAssets.get(asset.address)
      return { ...asset, name: knownAsset ? this.t(`assetNames.${asset.symbol}`) : '' }
    })
  }

  getFormattedAddress (asset: NamedAccountAsset): string {
    return formatAddress(asset.address, 56)
  }

  getAssetClasses (symbol: string): string {
    return getAssetIconClasses(symbol)
  }

  formatBalance (asset: NamedAccountAsset): string {
    return `${this.formatCodecNumber(asset.balance, asset.decimals)} ${asset.symbol}`
  }

  isZeroBalance (asset: NamedAccountAsset): boolean {
    return this.isCodecZero(asset.balance, asset.decimals)
  }

  formatConvertedAmount (asset: NamedAccountAsset): string {
    return '- USD'
  }

  handleAssetSwap (asset: NamedAccountAsset): void {
    this.$emit('swap', asset)
  }

  handleAssetSend (asset: NamedAccountAsset): void {
    this.navigate({ name: RouteNames.WalletSend, params: { asset } })
  }

  handleOpenAssetDetails (asset: NamedAccountAsset): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset } })
  }

  handleOpenAddAsset (): void {
    this.navigate({ name: RouteNames.AddAsset })
  }

  async handleCopy (asset: NamedAccountAsset): Promise<void> {
    try {
      await copyToClipboard(asset.address)
      this.$notify({
        message: this.t('assets.successCopy', { symbol: asset.symbol }),
        type: 'success',
        title: ''
      })
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: ''
      })
    }
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
    .asset {
      flex: 1;
      overflow-wrap: break-word;
      flex-direction: column;
      padding-right: $basic-spacing_small;
      padding-left: $basic-spacing_mini;
      width: 30%;
      &-info {
        @include hint-text;
      }
      &-id:hover {
        text-decoration: underline;
        cursor: pointer
      }
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
