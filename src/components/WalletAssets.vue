<template>
  <div class="wallet-assets s-flex" v-loading="loading">
    <div v-if="!!namedAccountAssets.length" class="wallet-assets-container">
      <template v-for="(asset, index) in namedAccountAssets">
        <div class="wallet-assets-item s-flex" :key="asset.address">
          <i :class="getAssetClasses(asset.address)" />
          <div class="asset s-flex">
            <div class="asset-value">{{ formatBalance(asset) }}</div>
            <div class="asset-info">{{ asset.name || asset.symbol }}
              <s-tooltip :content="t('assets.copy')">
                <span class="asset-id" @click="handleCopy(asset)">({{ getFormattedAddress(asset) }})</span>
              </s-tooltip>
            </div>
          </div>
          <s-button
            v-if="permissions.sendAssets"
            class="send"
            type="primary"
            size="small"
            icon="finance-send-24"
            :tooltip="t('assets.send')"
            :disabled="isZeroBalance(asset)"
            @click="handleAssetSend(asset)"
          />
          <s-button
            v-if="permissions.swapAssets"
            class="swap"
            type="primary"
            size="small"
            icon="arrows-swap-24"
            :tooltip="t('assets.swap')"
            @click="handleAssetSwap(asset)"
          />
          <s-button class="details" type="link" @click="handleOpenAssetDetails(asset)">
            <s-icon name="arrows-chevron-right-rounded-24" />
          </s-button>
        </div>
        <s-divider v-if="index !== namedAccountAssets.length - 1" class="wallet-assets-item_divider" :key="`${asset.address}-divider`" />
      </template>
    </div>
    <div v-else class="wallet-assets-empty">{{ t('assets.empty') }}</div>
    <s-button
      class="wallet-assets-add"
      icon="circle-plus-16"
      icon-position="right"
      @click="handleOpenAddAsset"
    >
      {{ t('assets.add') }}
    </s-button>
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
import { NamedAccountAsset } from '../types'

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
    }).filter(asset => !Number.isNaN(+asset.balance))
  }

  getFormattedAddress (asset: NamedAccountAsset): string {
    return formatAddress(asset.address, 10)
  }

  getAssetClasses (address: string): string {
    return getAssetIconClasses(address)
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

<style lang="scss">
.wallet-assets-item {
  .swap, .send {
    &:not(.s-action).s-i-position-left > span > i[class^=s-icon-] {
      margin-right: 0;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

$asset-item-height: 70px;

.wallet-assets {
  flex-direction: column;
  &-container {
    max-height: calc(#{$asset-item-height} * 5);
    overflow-y: auto;
  }
  &-item {
    align-items: center;
    height: $asset-item-height;
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
      &-id {
        outline: none;
        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
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
    &_divider {
      margin: 0;
    }
  }
  &-add {
    margin-top: $basic-spacing;
  }
  &-empty {
    text-align: center;
    @include hint-text;
  }
}
</style>
