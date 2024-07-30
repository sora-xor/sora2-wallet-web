<template>
  <component
    v-loading="loading"
    :is="currentRoute"
    @swap="(asset) => handleOperation(Operations.Swap, asset)"
    @liquidity="(asset) => handleOperation(Operations.Liquidity, asset)"
    @bridge="(asset) => handleOperation(Operations.Bridge, asset)"
    @learn-more="handleLearnMore"
    @close="handleClose"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import AddAsset from './components/AddAsset/AddAsset.vue';
import LoadingMixin from './components/mixins/LoadingMixin';
import TranslationMixin from './components/mixins/TranslationMixin';
import ReceiveToken from './components/ReceiveToken.vue';
import SelectAsset from './components/SelectAsset.vue';
import Wallet from './components/Wallet.vue';
import WalletAssetDetails from './components/WalletAssetDetails.vue';
import WalletConnection from './components/WalletConnection.vue';
import WalletSend from './components/WalletSend.vue';
import WalletTransactionDetails from './components/WalletTransactionDetails.vue';
import { state } from './store/decorators';
import { Operations } from './types/common';

import type { RouteNames } from './consts';
import type { AccountAsset } from '@sora-substrate/util/build/assets/types';

@Component({
  components: {
    AddAsset,
    SelectAsset,
    ReceiveToken,
    Wallet,
    WalletAssetDetails,
    WalletConnection,
    WalletSend,
    WalletTransactionDetails,
  },
})
export default class SoraWallet extends Mixins(LoadingMixin, TranslationMixin) {
  readonly Operations = Operations;

  @state.router.currentRoute currentRoute!: RouteNames;

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
}
</script>
