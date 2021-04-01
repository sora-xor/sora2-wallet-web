<template>
  <component v-if="!loading" :is="currentRoute" @close="handleClose" @swap="handleSwap" @learn-more="handleLearnMore" />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import AddAsset from './components/AddAsset.vue'
import CreateToken from './components/CreateToken.vue'
import Wallet from './components/Wallet.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import WalletConnection from './components/WalletConnection.vue'
import WalletSend from './components/WalletSend.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'

import LoadingMixin from './components/mixins/LoadingMixin'

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

  handleSwap (asset: any): void {
    this.$emit('swap', asset)
  }

  handleLearnMore (): void {
    this.$emit('learn-more')
  }
}
</script>
