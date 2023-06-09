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
          {{ t(assetIsAlreadyAdded ? 'addAsset.alreadyAttached' : 'addAsset.empty') }}
        </template>
      </asset-list>
    </div>
    <add-asset-details-card v-else :asset="selectedAsset" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { AddAssetTabs } from '../../consts';
import { getter } from '../../store/decorators';
import AssetList from '../AssetList.vue';
import SearchInput from '../Input/SearchInput.vue';
import AddAssetMixin from '../mixins/AddAssetMixin';
import LoadingMixin from '../mixins/LoadingMixin';

import AddAssetDetailsCard from './AddAssetDetailsCard.vue';

import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';

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
  /** `true` by default cuz we have a lot of assets */
  showVerifiedAssetsOnly = true;

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
    @include focus-outline($withOffset: true);
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
