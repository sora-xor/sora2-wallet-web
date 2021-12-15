<template>
  <wallet-base :title="title" show-back @back="handleBack"> </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';

import WalletBase from './WalletBase.vue';
import AssetListItem from './AssetListItem.vue';

import { RouteNames } from '../consts';

import type { AccountAsset } from '@sora-substrate/util';

@Component({
  components: {
    WalletBase,
    AssetListItem,
  },
})
export default class WalletRecieve extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any;
  @Getter accountAssets!: Array<AccountAsset>;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  step = 1;
  asset: Nullable<AccountAsset> = null;

  get title(): string {
    return this.asset ? `Recieve ${this.asset.symbol}` : 'Select an asset';
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }
}
</script>
