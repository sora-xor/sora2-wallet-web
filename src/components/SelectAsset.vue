<template>
  <wallet-base :title="t('asset.select')" show-back @back="handleBack">
    <asset-list :assets="accountAssets" divider>
      <template #default="asset">
        <s-button
          type="action"
          size="small"
          alternative
          :tooltip="t('asset.recieve', { symbol: asset.symbol })"
          @click="selectAsset(asset)"
        >
          <s-icon name="arrows-chevron-right-rounded-24" size="28" />
        </s-button>
      </template>
    </asset-list>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';

import WalletBase from './WalletBase.vue';
import AssetList from './AssetList.vue';

import { RouteNames } from '../consts';

import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    WalletBase,
    AssetList,
  },
})
export default class SelectAsset extends Mixins(TranslationMixin) {
  @Getter accountAssets!: Array<AccountAsset>;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  selectAsset(asset: AccountAsset): void {
    this.navigate({
      name: RouteNames.RecieveToken,
      params: {
        asset,
      },
    });
  }
}
</script>
