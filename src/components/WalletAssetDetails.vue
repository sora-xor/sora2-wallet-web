<template>
  <asset-details-sbt v-if="asset.isSBT" :asset="asset" />
  <asset-details-transferable v-else :asset="asset" />
</template>

<script lang="ts">
import { AccountAsset } from '@sora-substrate/util/build/assets/types';
import { Component, Mixins } from 'vue-property-decorator';

import { state } from '@/store/decorators';

import AssetDetailsSbt from './AssetDetails/AssetDetailsSBT.vue';
import AssetDetailsTransferable from './AssetDetails/AssetDetailsTransferable.vue';

@Component({
  components: {
    AssetDetailsTransferable,
    AssetDetailsSbt,
  },
})
export default class WalletAssetDetails extends Mixins() {
  @state.router.currentRouteParams private currentRouteParams!: Record<string, AccountAsset>;
  @state.account.accountAssets private accountAssets!: Array<AccountAsset>;

  get asset(): AccountAsset {
    // currentRouteParams.asset was added here to avoid a case when the asset is not found
    return (
      this.accountAssets.find(({ address }) => address === this.currentRouteParams.asset.address) ||
      this.currentRouteParams.asset
    );
  }
}
</script>
