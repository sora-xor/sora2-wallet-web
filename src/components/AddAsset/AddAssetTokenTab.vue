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
        <s-switch v-model="isVerifiedOnly" :disabled="loading" />
        <span>{{ t(`addAsset.${AddAssetTabs.Token}.switchBtn`) }}</span>
      </div>
      <synthetic-switcher class="add-asset-token__switch-btn" v-model="isSynthsOnly" />
      <asset-list
        :assets="foundAssets"
        class="asset-search-list"
        @click="(asset) => handleSelectAsset(asset)"
        :selectable="isVerifiedOnly"
        :selected="selectedAssets"
      >
        <template #list-empty>
          {{ t(assetIsAlreadyAdded ? 'addAsset.alreadyAttached' : 'addAsset.empty') }}
        </template>
      </asset-list>
      <s-button
        v-if="showAddButton"
        class="add-assets-button"
        type="primary"
        :loading="parentLoading || loading"
        @click="handleAdd"
      >
        {{ t('addAsset.add') }}
      </s-button>
    </div>
    <add-asset-details-card v-else :select-assets="selectedAssets" assetTypeKey="token" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../../api';
import { AddAssetTabs, syntheticAssetRegexp } from '../../consts';
import { getter } from '../../store/decorators';
import AssetList from '../AssetList.vue';
import SearchInput from '../Input/SearchInput.vue';
import AddAssetMixin from '../mixins/AddAssetMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import SyntheticSwitcher from '../shared/SyntheticSwitcher.vue';

import AddAssetDetailsCard from './AddAssetDetailsCard.vue';

import type { Asset, Whitelist } from '@sora-substrate/sdk/build/assets/types';

@Component({
  components: {
    AssetList,
    SearchInput,
    AddAssetDetailsCard,
    SyntheticSwitcher,
  },
})
export default class AddAssetToken extends Mixins(LoadingMixin, AddAssetMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @getter.account.whitelist private whitelist!: Whitelist;
  /** `true` by default cuz we have a lot of assets */
  isVerifiedOnly = true;
  isSynthsOnly = false;

  private get notAddedAssets(): Array<Asset> {
    return this.assets.filter(
      (asset) => !(asset.address in this.accountAssetsAddressTable) && !api.assets.isNft(asset)
    );
  }

  private get prefilteredAssets(): Array<Asset> {
    return this.notAddedAssets.filter((asset) => {
      if (this.isVerifiedOnly && !api.assets.isWhitelist(asset, this.whitelist)) return false;
      if (this.isSynthsOnly && !syntheticAssetRegexp.test(asset.address)) return false;
      return true;
    });
  }

  get foundAssets(): Array<Asset> {
    if (!this.searchValue) return this.prefilteredAssets;

    return this.getSoughtAssets(this.prefilteredAssets);
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

  get showAddButton(): boolean {
    return this.selectedAssets.length > 0;
  }

  handleAdd() {
    console.info('handle add was called');
    this.$emit('change-visibility');
    // this.selectedAssets.forEach((asset) => this.addAccountAsset(asset));
  }
}
</script>

<style lang="scss">
.asset-search-list {
  @include asset-list($basic-spacing-big);

  .asset {
    padding-left: $basic-spacing-big;
    padding-right: $basic-spacing-big;

    @include focus-outline($withOffset: true);

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
.add-assets-button {
  width: 100%;
}
</style>
