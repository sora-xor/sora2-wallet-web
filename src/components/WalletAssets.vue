<template>
  <div class="wallet-assets s-flex" v-loading="loading">
    <div v-if="!!formattedAccountAssets.length" class="wallet-assets-container">
      <template v-for="(asset, index) in formattedAccountAssets">
        <div class="wallet-assets-item s-flex" :key="asset.address">
          <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
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
            class="wallet-assets__button send"
            type="primary"
            rounded
            :tooltip="t('assets.send')"
            :disabled="isZeroBalance(asset)"
            @click="handleAssetSend(asset)"
          >
            <s-icon name="finance-send-24" />
          </s-button>
          <s-button
            v-if="permissions.swapAssets"
            class="wallet-assets__button swap"
            type="primary"
            rounded
            :tooltip="t('assets.swap')"
            @click="handleAssetSwap(asset)"
          >
            <s-icon name="arrows-swap-24" />
          </s-button>
          <s-button
            class="wallet-assets__button details"
            type="action"
            icon="arrows-chevron-right-rounded-24"
            alternative
            @click="handleOpenAssetDetails(asset)"
          >
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
import { getAssetIconStyles, formatAddress, copyToClipboard } from '../util'

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

  getAssetIconStyles = getAssetIconStyles

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

<style scoped lang="scss">
@import '../styles/icons';

$asset-icon-shadow-size: 3px;

.wallet-assets {
  flex-direction: column;
  margin-top: calc(var(--s-basic-spacing) * 2);

  &-container {
    max-height: calc(#{$asset-item-height} * 5);
    overflow-x: hidden;
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
      padding-right: calc(var(--s-basic-spacing) * 1.5);
      padding-left: calc(var(--s-basic-spacing) * 1.5);
      width: 30%;
      &-value, &-info {
        line-height: var(--s-line-height-base);
      }
      &-value {
        font-size: var(--s-font-size-medium);
        font-weight: 800;
      }
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
        padding: 0 var(--s-basic-spacing);
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
  &-add,
  &-empty {
    margin-top: calc(var(--s-basic-spacing) * 2);
  }
  &-empty {
    text-align: center;
    @include hint-text;
  }
  &__button {
    & + & {
      margin-left: var(--s-basic-spacing);
    }
  }
}
</style>
