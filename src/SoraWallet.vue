<template>
  <component
    v-loading="loading"
    :is="currentRoute"
    @swap="(asset) => handleOperation(Operations.Swap, asset)"
    @liquidity="(asset) => handleOperation(Operations.Liquidity, asset)"
    @bridge="(asset) => handleOperation(Operations.Bridge, asset)"
    @learn-more="handleLearnMore"
    @close="handleClose"
    @add-asset="handleShowAddAssetNotification"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

import AddAsset from './components/AddAsset.vue';
import AddAssetDetails from './components/AddAssetDetails.vue';
import CreateToken from './components/CreateToken.vue';
import Wallet from './components/Wallet.vue';
import WalletAssetDetails from './components/WalletAssetDetails.vue';
import WalletConnection from './components/WalletConnection.vue';
import WalletSend from './components/WalletSend.vue';
import WalletTransactionDetails from './components/WalletTransactionDetails.vue';

import LoadingMixin from './components/mixins/LoadingMixin';
import TranslationMixin from './components/mixins/TranslationMixin';

import { Operations } from './types/common';
import type { RouteNames } from './consts';

@Component({
  components: {
    AddAsset,
    AddAssetDetails,
    CreateToken,
    Wallet,
    WalletAssetDetails,
    WalletConnection,
    WalletSend,
    WalletTransactionDetails,
  },
})
export default class SoraWallet extends Mixins(LoadingMixin, TranslationMixin) {
  readonly Operations = Operations;

  @Getter currentRoute!: RouteNames;

  async created(): Promise<void> {
    this.withApi(() => {}); // We need it just for loading state
  }

  handleClose(): void {
    this.$emit('close');
  }

  handleOperation(operation: Operations, asset: AccountAsset): void {
    this.$emit(operation, asset);
  }

  handleLearnMore(): void {
    this.$emit('learn-more');
  }

  handleShowAddAssetNotification(): void {
    this.$notify({
      message: this.t('addAsset.success'),
      type: 'success',
      title: '',
    });
  }
}
</script>
