<template>
  <div class="asset-custom">
    <s-input
      ref="search"
      class="asset-custom-address"
      :maxlength="128"
      :placeholder="t(`addAsset.${AddAssetTabs.Custom}.addressPlaceholder`)"
      v-model="address"
      @change="handleSearch"
    />
    <div v-if="address && !selectedAsset" class="asset-custom-empty">
      {{ t(`addAsset.${alreadyAttached ? 'alreadyAttached' : 'empty'}`) }}
    </div>
    <s-button
      type="primary"
      class="s-typography-button--large"
      :disabled="!(selectedAsset && address)"
      @click="navigateToAddAssetDetails"
    >
      {{ t('addAsset.next') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { AccountAsset, Asset } from '@sora-substrate/util/build/assets/types';

import TranslationMixin from './mixins/TranslationMixin';
import { AddAssetTabs, RouteNames } from '../consts';
import { state, mutation } from '../store/decorators';
import type { Route } from '../store/router/types';

@Component
export default class AddAssetCustom extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @state.account.assets private assets!: Array<Asset>;
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  address = '';
  selectedAsset: Nullable<Asset> = null;
  alreadyAttached = false;

  mounted(): void {
    const input = this.$refs.search as any;

    if (input && typeof input.focus === 'function') {
      input.focus();
    }
  }

  async handleSearch(value: string): Promise<void> {
    this.alreadyAttached = false;
    if (!value.trim()) {
      this.selectedAsset = null;
      return;
    }
    const search = value.trim().toLowerCase();
    const asset = this.assets.find((asset) => asset.address.toLowerCase() === search);
    if (this.accountAssets.find(({ address }) => address.toLowerCase() === search)) {
      this.selectedAsset = null;
      this.alreadyAttached = true;
      return;
    }
    if (!this.selectedAsset || !this.selectedAsset.symbol) {
      this.selectedAsset = null;
      return;
    }
    this.selectedAsset = asset;
  }

  navigateToAddAssetDetails(): void {
    this.navigate({ name: RouteNames.AddAssetDetails, params: { asset: this.selectedAsset } });
  }
}
</script>

<style scoped lang="scss">
.asset-custom {
  > * {
    margin-top: #{$basic-spacing-medium};
  }
  &-empty {
    @include hint-text;
  }
  .el-button--primary {
    width: 100%;
  }
}
</style>
