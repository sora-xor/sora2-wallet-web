<template>
  <div class="add-asset-token">
    <div v-if="!tokenDetailsPageOpened" class="add-asset-token__page">
      <search-input
        autofocus
        v-model="search"
        :placeholder="t(`addAsset.searchInputText`)"
        :maxlength="100"
        @clear="resetSearch"
        class="add-asset-token__search"
      />
      <div class="add-asset-token__switch-btn">
        <s-switch v-model="showVerifiedAssetsOnly" :disabled="loading" />
        <span>{{ t(`addAsset.${AddAssetTabs.Token}.switchBtn`) }}</span>
      </div>
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
import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

import AssetList from '../AssetList.vue';
import SearchInput from '../SearchInput.vue';
import AddAssetDetailsCard from './AddAssetDetailsCard.vue';

import LoadingMixin from '../mixins/LoadingMixin';
import AddAssetMixin from '../mixins/AddAssetMixin';
import { AddAssetTabs } from '../../consts';
import { getter } from '../../store/decorators';
import { api } from '../../api';

@Component({
  components: {
    AssetList,
    SearchInput,
    AddAssetDetailsCard,
  },
})
export default class AddAssetToken extends Mixins(LoadingMixin, AddAssetMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @getter.account.whitelist private whitelist!: Whitelist;

  showVerifiedAssetsOnly = false;

  private get notAddedAssets(): Array<Asset> {
    return this.assets.filter(
      (asset) => !(asset.address in this.accountAssetsAddressTable) && !api.assets.isNft(asset)
    );
  }

  get whiteListedNotAddedAssets(): Array<Asset> {
    return this.notAddedAssets.filter((asset) => api.assets.isWhitelist(asset, this.whitelist));
  }

  get foundAssets(): Array<Asset> {
    const assetsToSearch = this.showVerifiedAssetsOnly ? this.whiteListedNotAddedAssets : this.notAddedAssets;
    if (!this.searchValue) return assetsToSearch;

    return this.getSoughtAssets(assetsToSearch);
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
}
</script>

<style lang="scss">
.asset-search-list {
  @include asset-list($basic-spacing-big);

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
.add-asset-token {
  margin-top: #{$basic-spacing-medium};

  &__switch-btn {
    display: flex;
    margin-bottom: 10px;
    .s-switch {
      margin-right: 12px;
    }
  }

  &__search {
    margin-bottom: #{$basic-spacing-medium};
  }
}
</style>
