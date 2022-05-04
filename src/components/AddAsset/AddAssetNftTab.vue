<template>
  <div class="add-asset-nft">
    <div v-if="!tokenDetailsPageOpened" class="add-asset-nft__page">
      <search-input
        autofocus
        v-model="search"
        :placeholder="t(`addAsset.searchInputText`)"
        :maxlength="100"
        @clear="resetSearch"
        class="add-asset-nft__input"
      />
      <asset-list :assets="foundAssets" class="asset-search-list" @click="handleSelectAsset">
        <template #list-empty>
          {{ t(`addAsset.${assetIsAlreadyAdded ? 'alreadyAttached' : 'empty'}`) }}
        </template>
      </asset-list>
    </div>
    <add-asset-details-card v-else :asset="asset" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { Asset } from '@sora-substrate/util/build/assets/types';

import AssetList from '../AssetList.vue';
import SearchInput from '../SearchInput.vue';
import AddAssetDetailsCard from './AddAssetDetailsCard.vue';

import TranslationMixin from '../mixins/TranslationMixin';
import AddAssetMixin from '../mixins/AddAssetMixin';
import { AddAssetTabs } from '../../consts';

@Component({
  components: {
    AssetList,
    SearchInput,
    AddAssetDetailsCard,
  },
})
export default class AddAssetNFT extends Mixins(TranslationMixin, AddAssetMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  private get notAddedNftAssets(): Array<Asset> {
    return this.assets.filter((asset) => !(asset.address in this.accountAssetsAddressTable) && asset.content);
  }

  get foundAssets(): Array<Asset> {
    if (!this.searchValue) return this.notAddedNftAssets;

    return this.notAddedNftAssets.filter(
      ({ name, symbol, address }) =>
        address.toLowerCase() === this.searchValue ||
        symbol.toLowerCase().includes(this.searchValue) ||
        name.toLowerCase().includes(this.searchValue)
    );
  }
}
</script>

<style scoped lang="scss">
.add-asset-nft {
  &__input {
    margin-top: #{$basic-spacing-medium};
    margin-bottom: #{$basic-spacing-medium};
  }
}
</style>
