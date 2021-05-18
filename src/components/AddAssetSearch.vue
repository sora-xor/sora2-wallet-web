<template>
  <div class="asset-search">
    <s-input
      ref="search"
      class="asset-search-input"
      border-radius="mini"
      :maxlength="100"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      v-model="search"
      @input="handleSearch"
    />
    <div class="asset-search-list" v-loading="assetsLoading || loading">
      <div v-if="assetIsAlreadyAdded || !foundAssets.length" class="asset-search-list_empty">
        {{ t(`addAsset.${assetIsAlreadyAdded ? 'alreadyAttached' : 'empty'}`) }}
      </div>
      <div
        v-else
        class="asset s-flex"
        v-for="asset in foundAssets"
        :key="asset.address"
        :class="{ 'selected': (selectedAsset || {}).address === asset.address }"
        @click="handleSelectAsset(asset)"
      >
        <i class="asset-logo" :style="getAssetIconStyles(asset.address)" />
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
    <s-button type="primary" :disabled="!selectedAsset || loading" @click="handleAddAsset">
      {{ t('addAsset.action') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AccountAsset, Asset } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import { AddAssetTabs, RouteNames } from '../consts'
import { copyToClipboard, formatAddress, getAssetIconStyles } from '../util'

@Component
export default class AddAssetSearch extends Mixins(TranslationMixin, LoadingMixin) {
  readonly AddAssetTabs = AddAssetTabs

  @Getter assets!: Array<Asset>
  @Getter assetsLoading!: boolean
  @Getter accountAssets!: Array<AccountAsset>
  @Getter accountAssetsAddressTable
  @Action navigate
  @Action getAssets
  @Action addAsset

  search = ''
  selectedAsset: Asset | null = null

  async mounted (): Promise<void> {
    await this.getAssets()

    const input = this.$refs.search as any

    if (input && typeof input.focus === 'function') {
      input.focus()
    }
  }

  get searchValue (): string {
    return this.search ? this.search.trim().toLowerCase() : ''
  }

  get notAddedAssets (): Array<Asset> {
    return this.assets.filter(asset => !(asset.address in this.accountAssetsAddressTable))
  }

  get foundAssets (): Array<Asset> {
    if (!this.searchValue) return this.notAddedAssets

    return this.notAddedAssets.filter(({ name, symbol, address }) =>
      address.toLowerCase() === this.searchValue ||
      symbol.toLowerCase().includes(this.searchValue) ||
      name.toLowerCase().includes(this.searchValue)
    )
  }

  get assetIsAlreadyAdded (): boolean {
    if (!this.searchValue) return false

    return this.accountAssets.some(({ name = '', symbol = '', address = '' }) =>
      address.toLowerCase() === this.searchValue ||
      symbol.toLowerCase() === this.searchValue ||
      name.toLowerCase() === this.searchValue
    )
  }

  handleSearch (): void {
    if (!this.selectedAsset) return

    const isSelectedAssetPresented = !!this.foundAssets.find(({ address }) => (this.selectedAsset || {}).address === address)

    if (!isSelectedAssetPresented) {
      this.selectedAsset = null
    }
  }

  formatName (asset: Asset): string {
    return asset.name || asset.symbol
  }

  handleSelectAsset (asset: Asset): void {
    this.selectedAsset = asset
  }

  async handleAddAsset (): Promise<void> {
    await this.withLoading(async () => await this.addAsset({ address: (this.selectedAsset || {}).address }))
    this.navigate({ name: RouteNames.Wallet })
    this.$emit('add-asset')
  }

  getAssetIconStyles = getAssetIconStyles

  getFormattedAddress (asset: Asset): string {
    return formatAddress(asset.address, 10)
  }

  async handleCopy (asset: Asset): Promise<void> {
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
    }
  }
  .el-button--primary {
    width: 100%;
  }
}
</style>
