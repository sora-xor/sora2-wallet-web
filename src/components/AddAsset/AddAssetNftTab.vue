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
      <asset-list :assets="foundAssets" class="asset-search-list" :selected="selectedAssets" @click="handleSelectAsset">
        <template #list-empty>
          {{ t(assetIsAlreadyAdded ? 'addAsset.alreadyAttached' : 'addAsset.empty') }}
        </template>
      </asset-list>
      <s-button
        v-if="showAddButton"
        class="add-nfts-button"
        type="primary"
        :loading="parentLoading || loading"
        @click="handleAdd"
      >
        {{ t('addAsset.add') }}
      </s-button>
    </div>
    <add-asset-details-card v-else :select-assets="selectedAssets" assetTypeKey="nft" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import AssetList from '../AssetList.vue';
import SearchInput from '../Input/SearchInput.vue';
import AddAssetMixin from '../mixins/AddAssetMixin';

import AddAssetDetailsCard from './AddAssetDetailsCard.vue';

import type { Asset } from '@sora-substrate/sdk/build/assets/types';

@Component({
  components: {
    AssetList,
    SearchInput,
    AddAssetDetailsCard,
  },
})
export default class AddAssetNFT extends Mixins(AddAssetMixin) {
  private get notAddedNftAssets(): Array<Asset> {
    return this.assets.filter((asset) => !(asset.address in this.accountAssetsAddressTable) && api.assets.isNft(asset));
  }

  get foundAssets(): Array<Asset> {
    if (!this.searchValue) return this.notAddedNftAssets;

    return this.getSoughtAssets(this.notAddedNftAssets);
  }

  get assetIsAlreadyAdded(): boolean {
    if (!this.searchValue) return false;

    return this.accountAssets
      .filter((asset) => api.assets.isNft(asset))
      .some(
        ({ name = '', symbol = '', address = '' }) =>
          address.toLowerCase() === this.searchValue ||
          symbol.toLowerCase() === this.searchValue ||
          name.toLowerCase() === this.searchValue
      );
  }

  get showAddButton(): boolean {
    return this.selectedAssets.length > 0;
  }

  handleAdd() {
    this.$emit('change-visibility');
  }
}
</script>

<style scoped lang="scss">
.add-asset-nft {
  &__input {
    margin-top: #{$basic-spacing-medium};
    margin-bottom: #{$basic-spacing-medium};
  }
  .asset {
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

.add-nfts-button {
  width: 100%;
}
</style>
