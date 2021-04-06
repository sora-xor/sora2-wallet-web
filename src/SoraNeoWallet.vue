<template>
  <component
    v-if="!loading"
    :is="currentRoute"
    @swap="(asset) => handleOperation(Operations.Swap, asset)"
    @liquidity="(asset) => handleOperation(Operations.Liquidity, asset)"
    @bridge="(asset) => handleOperation(Operations.Bridge, asset)"
    @learn-more="handleLearnMore"
    @close="handleClose"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { AccountAsset } from '@sora-substrate/util'

import AddAsset from './components/AddAsset.vue'
import CreateToken from './components/CreateToken.vue'
import Wallet from './components/Wallet.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import WalletConnection from './components/WalletConnection.vue'
import WalletSend from './components/WalletSend.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'

import LoadingMixin from './components/mixins/LoadingMixin'

import { Operations } from './types'
import { RouteNames } from './consts'

@Component({
  components: {
    WalletConnection,
    WalletSend,
    Wallet,
    WalletAssetDetails,
    AddAsset,
    CreateToken,
    WalletTransactionDetails
  }
})
export default class SoraNeoWallet extends Mixins(LoadingMixin) {
  readonly Operations = Operations

  @Getter currentRoute!: RouteNames
  @Getter isLoggedIn!: boolean
  @Action navigate

  async created (): Promise<void> {
    this.withApi(() => {}) // We need it just for loading state
  }

  mounted (): void {
    if (this.isLoggedIn) {
      this.navigate({ name: RouteNames.Wallet })
    }
  }

  handleClose (): void {
    this.$emit('close')
  }

  handleOperation (operation: Operations, asset: AccountAsset): void {
    this.$emit(operation, asset)
  }

  handleLearnMore (): void {
    this.$emit('learn-more')
  }
}
</script>
