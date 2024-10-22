<template>
  <wallet-base :title="t('asset.select')" show-back @back="handleBack">
    <asset-list :assets="accountAssets" divider class="select-asset-list" :with-tabindex="false">
      <template #default="asset">
        <s-button
          type="action"
          size="small"
          alternative
          :tooltip="t('asset.receive', { symbol: asset.symbol })"
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

import { RouteNames } from '../consts';
import { state, mutation } from '../store/decorators';

import AssetList from './AssetList.vue';
import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';

import type { Route } from '../store/router/types';
import type { AccountAsset } from '@sora-substrate/sdk/build/assets/types';

@Component({
  components: {
    WalletBase,
    AssetList,
  },
})
export default class SelectAsset extends Mixins(TranslationMixin) {
  @state.account.accountAssets accountAssets!: Array<AccountAsset>;
  @state.router.currentRouteParams private currentRouteParams!: Record<string, string>;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  get sendAddress(): string | undefined {
    return this.currentRouteParams.address;
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }

  selectAsset(asset: AccountAsset): void {
    const name = this.sendAddress ? RouteNames.WalletSend : RouteNames.ReceiveToken;

    this.navigate({
      name,
      params: {
        asset,
        address: this.sendAddress,
      },
    });
  }
}
</script>

<style lang="scss">
.select-asset-list {
  @include asset-list($basic-spacing-big, $basic-spacing-big);
}
</style>
