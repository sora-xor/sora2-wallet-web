<template>
  <div class="asset-search">
    <search-input
      autofocus
      v-model="search"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      :maxlength="100"
      @clear="resetSearch"
      class="asset-search-input"
    />
    <asset-list :assets="foundAssets" class="asset-search-list" @click="handleSelectAsset">
      <template #list-empty>
        {{ t(`addAsset.${assetIsAlreadyAdded ? 'alreadyAttached' : 'empty'}`) }}
      </template>
    </asset-list>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import AssetList from './AssetList.vue';
import SearchInput from './SearchInput.vue';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import { AddAssetTabs, RouteNames } from '../consts';
import type { AccountAssetsTable } from '../types/common';

@Component({
  components: {
    AssetList,
    SearchInput,
  },
})
export default class AddAssetSearch extends Mixins(TranslationMixin, LoadingMixin) {
  readonly AddAssetTabs = AddAssetTabs;
  @Getter assets!: Array<Asset>;
  @Getter accountAssets!: Array<AccountAsset>;
  @Getter accountAssetsAddressTable!: AccountAssetsTable;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  search = '';

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

  handleSelectAsset(asset: Asset): void {
    this.navigate({ name: RouteNames.AddAssetDetails, params: { asset } });
  }

  resetSearch(): void {
    this.search = '';
  }
}
</script>

<style lang="scss">
.asset-search-list {
  @include asset-list-scrollbar($basic-spacing-big);

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
}
</style>
