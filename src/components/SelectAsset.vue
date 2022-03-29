<template>
  <wallet-base :title="t('asset.select')" show-back @back="handleBack">
    <asset-list :assets="accountAssets" divider class="select-asset-list">
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
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import TranslationMixin from './mixins/TranslationMixin';

import WalletBase from './WalletBase.vue';
import AssetList from './AssetList.vue';

import { RouteNames } from '../consts';
import { state, mutation } from '../store/decorators';
import type { Route } from '../store/router/types';

@Component({
  components: {
    WalletBase,
    AssetList,
  },
})
export default class SelectAsset extends Mixins(TranslationMixin) {
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;

  @mutation.router.navigate private navigate!: (options: Route) => void;

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

<style lang="scss">
.select-asset-list {
  @include asset-list-scrollbar($basic-spacing-big, $basic-spacing-big, $basic-spacing-big);
}
</style>
