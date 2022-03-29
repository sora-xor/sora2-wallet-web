<template>
  <div class="asset-search">
    <s-input
      ref="search"
      class="asset-search-input"
      prefix="s-icon-search-16"
      :maxlength="100"
      :placeholder="t(`addAsset.${AddAssetTabs.Search}.placeholder`)"
      v-model="search"
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
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import AssetList from './AssetList.vue';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import { AddAssetTabs, RouteNames } from '../consts';
import { state, getter, mutation } from '../store/decorators';
import type { AccountAssetsTable } from '../types/common';
import type { Route } from '../store/router/types';

@Component({
  components: {
    AssetList,
  },
})
export default class AddAssetSearch extends Mixins(TranslationMixin, LoadingMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @state.account.assets private assets!: Array<Asset>;
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;
  @getter.account.accountAssetsAddressTable private accountAssetsAddressTable!: AccountAssetsTable;

  @mutation.router.navigate private navigate!: (options: Route) => Promise<void>;

  search = '';

  mounted(): void {
    const input = this.$refs.search as any;

    if (input && typeof input.focus === 'function') {
      input.focus();
    }
  }

  private get searchValue(): string {
    return this.search ? this.search.trim().toLowerCase() : '';
  }

  private get notAddedAssets(): Array<Asset> {
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
