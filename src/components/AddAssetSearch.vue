<template>
  <div class="asset-search">
    <s-input
      class="asset-search-input"
      :maxlength="100"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      border-radius="mini"
      v-model="search"
      @change="handleSearch"
    />
    <div class="asset-search-list" v-if="!!foundAssets">
      <div class="asset-search-list_info" v-if="!(search || foundAssets.length)">
        {{ t(`addAsset.${AddAssetTabs.Search}.info`) }}
      </div>
      <div v-if="search && !foundAssets.length" class="asset-search-list_empty">
        {{ t(`addAsset.${AddAssetTabs.Search}.empty`) }}
      </div>
      <div
        class="asset s-flex"
        v-for="asset in foundAssets"
        :key="asset.address"
        :class="{ 'selected': (selectedAsset || {}).address === asset.address }"
        @click="handleSelectAsset(asset)"
      >
        <i :class="getAssetClasses(asset.symbol)" />
        <div class="asset-description s-flex">
          <div class="asset-description_name">{{ asset.name }}</div>
          <div class="asset-description_symbol">{{ asset.symbol }}</div>
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
import { AccountAsset, Asset } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import { AddAssetTabs, RouteNames } from '../consts'
import { getAssetIconClasses } from '../util'

type NamedAsset = Asset & { name: string }

@Component
export default class AddAssetSearch extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs

  @Getter assets!: Array<Asset>
  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate
  @Action getAssets
  @Action addAsset

  search = ''
  selectedAsset: NamedAsset | null = null
  foundAssets: Array<NamedAsset> = []

  mounted (): void {
    this.getAssets().then(this.handleSearch)
  }

  handleSearch (value?: string): void {
    const assets = this.assets
      .filter(asset => !this.accountAssets.find(accountAsset => accountAsset.address === asset.address))
      .map(asset => ({ ...asset, name: this.t(`assetNames.${asset.symbol}`) }))
    if (!value || !value.trim()) {
      this.foundAssets = assets
      this.selectedAsset = null
      return
    }
    const search = value.trim().toLowerCase()
    this.foundAssets = assets.filter(({ name, symbol }) => {
      return symbol.toLowerCase().includes(search) || name.toLowerCase().includes(search)
    })
    if (this.selectedAsset && !this.foundAssets.find(({ address }) => (this.selectedAsset || {}).address === address)) {
      this.selectedAsset = null
    }
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

  getAssetClasses (symbol: string): string {
    return getAssetIconClasses(symbol)
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

$asset-list-height: 350px;

.asset-search {
  margin-top: $basic-spacing;
  &-input {
    margin-bottom: $basic-spacing;
  }
  &-list {
    height: $asset-list-height;
    overflow-y: auto;
    margin-bottom: $basic-spacing;
    &_info,
    &_empty {
      @include hint-text;
    }
    &_empty {
      text-align: center;
    }
    .asset {
      align-items: center;
      padding: $basic-spacing_mini / 2;
      margin-right: $basic-spacing_mini / 2;
      // TODO: Add styles as for DEX Search popup
      &:hover, &.selected {
        background-color: var(--s-color-base-background-hover);
        cursor: pointer;
      }
      &-logo {
        margin-right: $basic-spacing;
        @include asset-logo-styles;
      }
      &-description {
        flex: 1;
        flex-direction: column;
        &_name {
          font-weight: bold;
        }
        &_symbol {
          @include hint-text;
        }
      }
      &:not(:last-child) {
        margin-bottom: $basic-spacing / 2;
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
