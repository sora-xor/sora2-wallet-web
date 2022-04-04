<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
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
import { Action, Getter } from 'vuex-class';
import type { Asset, Whitelist } from '@sora-substrate/util/build/assets/types';
import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

import LoadingMixin from './mixins/LoadingMixin';
import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import AddAssetDetailsCard from './AddAssetDetailsCard.vue';
import { RouteNames } from '../consts';

import type { WhitelistIdsBySymbol } from '../types/common';

@Component({
  components: {
    WalletBase,
    AddAssetDetailsCard,
  },
})
export default class AddAssetDetails extends Mixins(TranslationMixin, LoadingMixin) {
  asset: Nullable<Asset> = null;

  @Getter currentRouteParams!: any;
  @Getter whitelist!: Whitelist;
  @Getter whitelistIdsBySymbol!: WhitelistIdsBySymbol;
  @Getter libraryTheme!: Theme;

  @Action back!: AsyncVoidFn;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action addAsset!: (address?: string) => Promise<void>;

  created(): void {
    if (!this.currentRouteParams.asset) {
      this.back();
      return;
    }
    this.asset = this.currentRouteParams.asset;
  }

  handleBack(): void {
    this.back();
  }

  async handleAddAsset(): Promise<void> {
    await this.withLoading(async () => await this.addAsset((this.asset || {}).address));
    this.navigate({ name: RouteNames.Wallet, params: { asset: this.asset } });
    this.$emit('add-asset');
  }
}
</script>
