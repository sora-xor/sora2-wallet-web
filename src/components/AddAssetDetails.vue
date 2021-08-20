<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset-details">
      <s-card shadow="always" size="small" border-radius="mini" pressed>
        <div class="add-asset-details_asset" v-if="asset">
          <i class="asset-logo" :style="assetIconStyles" />
          <div class="asset-description s-flex">
            <div class="asset-description_symbol">{{ asset.symbol }}</div>
            <div class="asset-description_info">{{ formattedName }}
              <s-tooltip :content="t('assets.copy')">
                <span class="asset-id" @click="handleCopy($event)">({{ formattedAddress }})</span>
              </s-tooltip>
            </div>
            <s-card size="mini" :status="assetCardStatus" primary>
              <div class="asset-nature">{{ assetNatureText }}</div>
            </s-card>
          </div>
        </div>
      </s-card>
      <s-card status="warning" :primary="isCardPrimary" shadow="always" class="add-asset-details_text">
        <div class="p2">{{ t('addAsset.warningTitle') }}</div>
        <div class="warning-text p4">{{ t('addAsset.warningMessage') }}</div>
      </s-card>
      <div class="add-asset-details_confirm">
        <s-switch v-model="isConfirmed" :disabled="loading" />
        <span>{{ t('addAsset.understand') }}</span>
      </div>
      <s-button class="add-asset-details_action s-typography-button--large" type="primary" :disabled="!asset || !isConfirmed || loading" @click="handleAddAsset">
        {{ t('addAsset.action') }}
      </s-button>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { Asset, isWhitelistAsset, isBlacklistAsset, Whitelist } from '@sora-substrate/util'
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme'

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
  @Getter whitelist!: Whitelist
  @Getter whitelistIdsBySymbol!: any
  @Getter libraryTheme

  @Action back!: () => Promise<void>
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>
  @Action addAsset!: (options: { address?: string }) => Promise<void>

  created (): void {
    if (!this.currentRouteParams.asset) {
      this.back()
      return
    }
    this.asset = this.currentRouteParams.asset
  }

  get isCardPrimary (): boolean {
    return this.libraryTheme !== Theme.DARK
  }

  get isWhitelist (): boolean {
    if (!this.asset) {
      return false
    }
    return isWhitelistAsset(this.asset, this.whitelist)
  }

  get isBlacklist (): boolean {
    if (!this.asset) {
      return false
    }
    return isBlacklistAsset(this.asset, this.whitelistIdsBySymbol)
  }

  get assetCardStatus (): string {
    return this.isWhitelist ? 'success' : 'error'
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
  & > *:not(:last-child) {
    margin-bottom: #{$basic-spacing-medium};
  }

  &_asset {
    display: flex;
    align-items: center;

    .asset {
      &-logo {
        margin-right: #{$basic-spacing-medium};
        @include asset-logo-styles(40px);
      }
      &-description {
        flex: 1;
        flex-direction: column;
        align-items: flex-start;

        &_symbol {
          font-size: var(--s-font-size-big);
          line-height: var(--s-line-height-small);
          font-weight: 600;
        }
        &_info {
          @include hint-text;
          color: var(--s-color-base-content-primary);
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
        font-size: var(--s-font-size-mini);
        font-weight: 300;
        letter-spacing: var(--s-letter-spacing-small);
        line-height: var(--s-line-height-medium);
      }
    }
  }
  &_confirm {
    @include switch-block;
    padding-top: 0;
    padding-bottom: 0;
  }
  &_action {
    width: 100%;
  }
  &_text {
    color: var(--s-color-status-warning);
  }
}
</style>
