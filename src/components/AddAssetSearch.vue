<template>
  <div class="asset-search">
    <s-input
      class="asset-search-input"
      :maxlength="100"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      border-radius="mini"
      v-model="search"
      @input="handleSearch"
    />
    <div class="asset-search-list" v-if="!!foundAssets">
      <div class="asset-search-list_info" v-if="!(search || foundAssets.length)">
        {{ t(`addAsset.${AddAssetTabs.Search}.info`) }}
      </div>
      <div v-if="search && !foundAssets.length" class="asset-search-list_empty">
        {{ t(`addAsset.${alreadyAttached ? 'alreadyAttached' : 'empty'}`) }}
      </div>
      <div
        class="asset s-flex"
        v-for="asset in foundAssets"
        :key="asset.address"
        :class="{ 'selected': (selectedAsset || {}).address === asset.address }"
        @click="handleSelectAsset(asset)"
      >
        <i :class="getAssetClasses(asset.address)" />
        <div class="asset-description s-flex">
          <div class="asset-description_symbol">{{ asset.symbol }}</div>
          <div class="asset-description_info">{{ formatName(asset) }}
            <s-tooltip :content="t('assets.copy')">
              <span class="asset-id" @click="handleCopy(asset)">({{ getFormattedAddress(asset) }})</span>
            </s-tooltip>
          </div>
        </div>
      </div>
    </div>
    <div class="asset-search-actions s-flex">
      <s-button @click="handleBack">
        {{ t('addAsset.cancel') }}
      </s-button>
      <s-button type="primary" :disabled="!selectedAsset" @click="handleAddAsset">
        {{ t('addAsset.action') }}
      </s-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, Asset, KnownAssets, KnownSymbols } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import { AddAssetTabs, RouteNames } from '../consts'
import { copyToClipboard, formatAddress, getAssetIconClasses } from '../util'
import { NamedAsset } from '../types'

@Component
export default class AddAssetSearch extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs
  readonly KnownSymbols = KnownSymbols

  @Getter assets!: Array<Asset>
  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate
  @Action getAssets
  @Action addAsset

  search = ''
  selectedAsset: NamedAsset | null = null
  foundAssets: Array<NamedAsset> = []
  alreadyAttached = false

  mounted (): void {
    this.getAssets().then(this.handleSearch)
  }

  handleSearch (value?: string): void {
    this.alreadyAttached = false
    const assets = this.assets
      .filter(asset => !this.accountAssets.find(accountAsset => accountAsset.address === asset.address))
      .map(asset => {
        const knownAsset = KnownAssets.get(asset.address)
        return { ...asset, name: knownAsset ? this.t(`assetNames.${asset.symbol}`) : '' }
      })
    if (!value || !value.trim()) {
      this.foundAssets = assets
      this.selectedAsset = null
      return
    }
    const search = value.trim().toLowerCase()
    const attached = this.accountAssets.find(({ symbol, address }) => {
      const knownAsset = KnownAssets.get(address)
      return address.toLowerCase() === search || (symbol || '').toLowerCase() === search || (knownAsset && this.t(`assetNames.${symbol}`).toLowerCase() === search)
    })
    if (attached) {
      this.alreadyAttached = true
      this.foundAssets = []
      this.selectedAsset = null
      return
    }
    this.foundAssets = assets.filter(({ name, symbol, address }) => {
      return address.toLowerCase() === search || symbol.toLowerCase().includes(search) || name.toLowerCase().includes(search)
    })
    if (this.selectedAsset && !this.foundAssets.find(({ address }) => (this.selectedAsset || {}).address === address)) {
      this.selectedAsset = null
    }
  }

  formatName (asset: NamedAsset): string {
    if (!asset.name || asset.name.includes('assetNames')) {
      return asset.symbol
    }
    return asset.name
  }

  handleSelectAsset (asset: NamedAsset): void {
    this.selectedAsset = asset
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleAddAsset (): Promise<void> {
    await this.addAsset({ address: (this.selectedAsset || {}).address })
    this.navigate({ name: RouteNames.Wallet })
    this.$emit('add-asset')
  }

  getAssetClasses (address: string): string {
    return getAssetIconClasses(address)
  }

  getFormattedAddress (asset: NamedAsset): string {
    return formatAddress(asset.address, 10)
  }

  async handleCopy (asset: NamedAsset): Promise<void> {
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

$asset-item-height: 71px;

.asset-search {
  margin-top: $basic-spacing;
  &-input {
    margin-bottom: $basic-spacing;
  }
  &-list {
    height: calc(#{$asset-item-height} * 5);
    overflow-y: auto;
    margin-left: -#{$basic-spacing_big};
    margin-right: -#{$basic-spacing_big};
    &_info,
    &_empty {
      @include hint-text;
      padding-left: $basic-spacing_big;
      padding-right: $basic-spacing_big;
    }
    &_empty {
      text-align: center;
    }
    .asset {
      align-items: center;
      height: $asset-item-height;
      padding: 0 $basic-spacing_big;
      &:hover, &.selected {
        background-color: var(--s-color-base-background-hover);
        cursor: pointer;
      }
      &-logo {
        margin-right: $basic-spacing;
        @include asset-logo-styles(40px);
      }
      &-description {
        flex: 1;
        flex-direction: column;
        line-height: $line-height_medium;
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
    }
  }
  &-actions {
    > * {
      flex: .5;
    }
  }
}
</style>
