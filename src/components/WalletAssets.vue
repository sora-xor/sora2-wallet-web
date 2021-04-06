<template>
  <div class="wallet-assets s-flex" v-loading="loading">
    <div v-if="!!formattedAccountAssets.length" class="wallet-assets-container">
      <template v-for="(asset, index) in formattedAccountAssets">
        <div class="wallet-assets-item s-flex" :key="asset.address">
          <i :class="getAssetClasses(asset.address)" />
          <div class="asset s-flex">
            <div class="asset-value">{{ formatBalance(asset) }}
              <div v-if="hasLockedBalance(asset)" class="asset-value-locked p4">
                <s-icon name="lock-16" size="12px" />
                {{ formatLockedBalance(asset) }}
              </div>
            </div>
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
        <s-divider v-if="index !== formattedAccountAssets.length - 1" class="wallet-assets-item_divider" :key="`${asset.address}-divider`" />
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
import { AccountAsset } from '@sora-substrate/util'

import NumberFormatterMixin from './mixins/NumberFormatterMixin'
import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import { RouteNames } from '../consts'
import { getAssetIconClasses, formatAddress, copyToClipboard } from '../util'

@Component
export default class WalletAssets extends Mixins(TranslationMixin, LoadingMixin, NumberFormatterMixin) {
  @Getter accountAssets!: Array<AccountAsset>
  @Getter permissions
  @Action getAccountAssets
  @Action navigate

  async mounted (): Promise<void> {
    this.withApi(this.getAccountAssets)
  }

  get formattedAccountAssets (): Array<AccountAsset> {
    return this.accountAssets.filter(asset => asset.balance && !Number.isNaN(+asset.balance.transferable))
  }

  getFormattedAddress (asset: AccountAsset): string {
    return formatAddress(asset.address, 10)
  }

  getAssetClasses (address: string): string {
    return getAssetIconClasses(address)
  }

  formatBalance (asset: AccountAsset): string {
    return `${this.formatCodecNumber(asset.balance.transferable, asset.decimals)} ${asset.symbol}`
  }

  isZeroBalance (asset: AccountAsset): boolean {
    return this.isCodecZero(asset.balance.transferable, asset.decimals)
  }

  hasLockedBalance (asset: AccountAsset): boolean {
    return !this.isCodecZero(asset.balance.locked, asset.decimals)
  }

  formatLockedBalance (asset: AccountAsset): string {
    return this.formatCodecNumber(asset.balance.locked, asset.decimals)
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

  handleOpenAssetDetails (asset: AccountAsset): void {
    this.navigate({ name: RouteNames.WalletAssetDetails, params: { asset } })
  }

  handleOpenAddAsset (): void {
    this.navigate({ name: RouteNames.AddAsset })
  }

  async handleCopy (asset: AccountAsset): Promise<void> {
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
  $button-width: 48px;
  .swap, .send {
    max-width: $button-width;
    &:not(.s-action).s-i-position-left > span > i[class^=s-icon-] {
      margin-right: 0;
    }
  }
}
</style>

<style scoped lang="scss">
@import '../styles/icons';

$asset-item-height: 70px;
$asset-icon-shadow-size: 3px;

.wallet-assets {
  flex-direction: column;
  &-container {
    max-height: calc(#{$asset-item-height} * 5);
    overflow-y: auto;
  }
  &-item {
    align-items: center;
    height: $asset-item-height;
    padding-left: $asset-icon-shadow-size;
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
      &-value-locked {
        display: inline-flex;
        align-items: baseline;
        color: var(--s-color-base-content-secondary);
        background: var(--s-color-base-background);
        padding: 0 $basic-spacing_mini;
        border-radius: var(--s-border-radius-mini);
        > .s-icon-lock-16 {
          color: var(--s-color-base-content-secondary);
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
