<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset-details">
      <div class="add-asset-details_asset" v-if="asset">
        <i class="asset-logo" :style="assetIconStyles" />
        <div class="asset-description s-flex">
          <div class="asset-description_symbol">{{ asset.symbol }}</div>
          <div class="asset-description_info">{{ formattedName }}
            <s-tooltip :content="t('assets.copy')">
              <span class="asset-id" @click="handleCopy($event)">({{ formattedAddress }})</span>
            </s-tooltip>
          </div>
          <div class="asset-nature" :style="assetNatureStyles">{{ assetNatureText }}</div>
        </div>
      </div>
      <div class="add-asset-details_text">
        <span class="p2">{{ t('addAsset.warningTitle') }}</span>
        <span class="warning-text p4">{{ t('addAsset.warningMessage') }}</span>
      </div>
      <div class="add-asset-details_confirm">
        <span>{{ t('addAsset.understand') }}</span>
        <s-switch v-model="isConfirmed" :disabled="loading" />
      </div>
      <s-button class="add-asset-details_action" type="primary" :disabled="!asset || !isConfirmed || loading" @click="handleAddAsset">
        {{ t('addAsset.action') }}
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { Asset } from '@sora-substrate/util'
import { isWhitelistAsset, isBlacklistAsset } from 'polkaswap-token-whitelist'

import LoadingMixin from './mixins/LoadingMixin'
import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '@/consts'
import { copyToClipboard, formatAddress, getAssetIconStyles } from '@/util'

@Component({
  components: {
    WalletBase
  }
})
export default class AddAssetDetails extends Mixins(TranslationMixin, LoadingMixin) {
  asset: Asset | null = null
  isConfirmed = false

  @Getter currentRouteParams!: any

  @Action back!: () => Promise<void>
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>
  @Action addAsset!: (options: { address?: string }) => Promise<void>

  mounted (): void {
    if (!this.currentRouteParams.asset) {
      this.back()
      return
    }
    this.asset = this.currentRouteParams.asset
  }

  get isWhitelist (): boolean {
    if (!this.asset) {
      return false
    }
    return isWhitelistAsset(this.asset)
  }

  get isBlacklist (): boolean {
    if (!this.asset) {
      return false
    }
    return isBlacklistAsset(this.asset)
  }

  get assetNatureStyles (): object {
    const styles = {}
    if (!this.asset) {
      return styles
    }
    return {
      color: `var(--s-color-status-${this.isWhitelist ? 'success' : 'error'})`
    }
  }

  get assetNatureText (): string {
    if (!this.asset) {
      return ''
    }
    const isWhitelist = this.isWhitelist
    const isBlacklist = this.isBlacklist
    if (isWhitelist) {
      return this.t('addAsset.approved')
    }
    if (isBlacklist) {
      return this.t('addAsset.scam')
    }
    return this.t('addAsset.unknown')
  }

  get formattedName (): string {
    if (!this.asset) {
      return ''
    }
    return this.asset.name || this.asset.symbol
  }

  get assetIconStyles (): object {
    if (!this.asset) {
      return {}
    }
    return getAssetIconStyles(this.asset.address)
  }

  get formattedAddress (): string {
    if (!this.asset) {
      return ''
    }
    return formatAddress(this.asset.address, 10)
  }

  async handleCopy (event: Event): Promise<void> {
    event.stopImmediatePropagation()
    if (!this.asset) {
      return
    }
    try {
      await copyToClipboard(this.asset.address)
      this.$notify({
        message: this.t('assets.successCopy', { symbol: this.asset.symbol }),
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

  handleBack (): void {
    this.back()
  }

  async handleAddAsset (): Promise<void> {
    await this.withLoading(async () => await this.addAsset({ address: (this.asset || {}).address }))
    this.navigate({ name: RouteNames.Wallet, params: { asset: this.asset } })
    this.$emit('add-asset')
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

.add-asset-details {
  &_asset {
    display: flex;
    align-items: center;
    background: var(--s-color-base-background);
    padding: $basic-spacing_small $basic-spacing;
    margin-bottom: $basic-spacing;
    border-radius: var(--s-border-radius-small);
    .asset {
      &-logo {
        margin-right: $basic-spacing;
        @include asset-logo-styles(40px);
      }
      &-description {
        flex: 1;
        flex-direction: column;
        line-height: var(--s-line-height-big);
        &_symbol {
          font-feature-settings: var(--s-font-feature-settings-common);
          font-weight: 600;
        }
        &_info {
          @include hint-text;
          .asset-id {
            outline: none;
            &:hover {
              text-decoration: underline;
              cursor: pointer;
            }
          }
        }
      }
      &-nature {
        font-size: $font-size_small;
      }
    }
  }
  &_text {
    display: flex;
    flex-direction: column;
    padding: $basic-spacing;
    margin-bottom: $basic-spacing;
    border: 1px solid var(--s-color-base-border-secondary);
    border-radius: var(--s-border-radius-small);
    .warning-text {
      color: var(-s-color-base-content-secondary);
    }
  }
  &_confirm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--s-color-base-background);
    padding: $basic-spacing_small $basic-spacing;
    border-radius: var(--s-border-radius-mini);
    margin-bottom: $basic-spacing;
  }
  &_action {
    width: 100%;
  }
}
</style>
