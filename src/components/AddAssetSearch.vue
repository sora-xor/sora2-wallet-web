<template>
  <div class="asset-search">
    <s-input
      ref="search"
      class="asset-search-input"
      prefix="s-icon-search-16"
      :maxlength="100"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      v-model="search"
      @input="handleSearch"
    />
    <asset-list :assets="foundAssets" class="asset-search-list">
      <template #empty>
        {{ t(`addAsset.${assetIsAlreadyAdded ? 'alreadyAttached' : 'empty'}`) }}
      </template>
      <template #default="{ asset }">
        <asset-list-item
          :asset="asset"
          :key="asset.address"
          :class="{ selected: (selectedAsset || {}).address === asset.address }"
          @click="handleSelectAsset(asset)"
        />
      </template>
    </asset-list>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import type { AccountAsset, Asset } from '@sora-substrate/util';

import AssetList from './AssetList.vue';
import AssetListItem from './AssetListItem.vue';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import { AddAssetTabs, RouteNames } from '../consts';

@Component({
  components: {
    AssetList,
    AssetListItem,
  },
})
export default class AddAssetSearch extends Mixins(TranslationMixin, LoadingMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @Getter assets!: Array<Asset>;
  @Getter assetsLoading!: boolean;
  @Getter accountAssets!: Array<AccountAsset>;
  @Getter accountAssetsAddressTable!: any;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getAssets!: AsyncVoidFn;

  search = '';
  selectedAsset: Nullable<Asset> = null;

  async mounted(): Promise<void> {
    await this.getAssets();

    const input = this.$refs.search as any;

    if (input && typeof input.focus === 'function') {
      input.focus();
    }
  }

  get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  get notAddedAssets(): Array<Asset> {
    return this.assets.filter((asset) => !(asset.address in this.accountAssetsAddressTable));
  }

  get foundAssets(): Array<Asset> {
    if (!this.searchValue) return this.notAddedAssets;

    return this.notAddedAssets.filter(
      ({ name, symbol, address }) =>
        address.toLowerCase() === this.searchValue ||
        symbol.toLowerCase().includes(this.searchValue) ||
        name.toLowerCase().includes(this.searchValue)
    );
  }

  get assetIsAlreadyAdded(): boolean {
    if (!this.searchValue) return false;

    return this.accountAssets.some(
      ({ name = '', symbol = '', address = '' }) =>
        address.toLowerCase() === this.searchValue ||
        symbol.toLowerCase() === this.searchValue ||
        name.toLowerCase() === this.searchValue
    );
  }

  handleSearch(): void {
    if (!this.selectedAsset) return;

    const isSelectedAssetPresented = !!this.foundAssets.find(
      ({ address }) => (this.selectedAsset || {}).address === address
    );

    if (!isSelectedAssetPresented) {
      this.selectedAsset = null;
    }
  }

  handleSelectAsset(asset: Asset): void {
    this.selectedAsset = asset;
    this.navigate({ name: RouteNames.AddAssetDetails, params: { asset: this.selectedAsset } });
  }
}
</script>

<style lang="scss">
.asset-search-list {
  &.el-scrollbar .el-scrollbar__view {
    padding-left: 0;
    padding-right: 0;
  }

  .asset {
    padding-left: $basic-spacing-big;
    padding-right: $basic-spacing-big;

    &:hover,
    &.selected {
      background-color: var(--s-color-base-background-hover);
      cursor: pointer;
    }

    &-symbol {
      font-size: var(--s-font-size-default);
    }
  }
}
</style>

<style scoped lang="scss">
.asset-search {
  margin-top: #{$basic-spacing-medium};

  &-input {
    margin-bottom: #{$basic-spacing-medium};
  }

  .el-button--primary {
    width: 100%;
  }
}
</style>
