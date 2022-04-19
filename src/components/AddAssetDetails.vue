<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="back">
    <add-asset-details-card
      :asset="asset"
      :loading="loading"
      :theme="libraryTheme"
      :whitelist="whitelist"
      :whitelist-ids-by-symbol="whitelistIdsBySymbol"
      @add="handleAddAsset"
    />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';
import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import AddAssetDetailsCard from './AddAssetDetailsCard.vue';
import { RouteNames } from '../consts';
import { api } from '../api';
import { state, getter, mutation, action } from '../store/decorators';
import type { WhitelistIdsBySymbol } from '../types/common';
import type { Route } from '../store/router/types';

@Component({
  components: {
    WalletBase,
    AddAssetDetailsCard,
  },
})
export default class AddAssetDetails extends Mixins(TranslationMixin, LoadingMixin) {
  asset: Nullable<Asset> = null;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<Asset>>;
  @getter.account.whitelist whitelist!: Whitelist;
  @getter.account.whitelistIdsBySymbol whitelistIdsBySymbol!: WhitelistIdsBySymbol;
  @getter.libraryTheme libraryTheme!: Theme;

  @mutation.router.navigate private navigate!: (options: Route) => void;
  @action.account.addAsset private addAsset!: (address?: string) => Promise<void>;
  @action.router.back back!: AsyncVoidFn;

  created(): void {
    if (!this.currentRouteParams.asset) {
      this.back();
      return;
    }
    this.asset = this.currentRouteParams.asset;
  }

  async handleAddAsset(): Promise<void> {
    const asset: Partial<Asset> = this.asset || {};
    await this.withLoading(async () => await this.addAsset(asset.address));
    this.navigate({ name: RouteNames.Wallet, params: { asset: this.asset } });
    this.$emit('add-asset', asset.symbol);
  }
}
</script>
