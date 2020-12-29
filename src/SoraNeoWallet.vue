<template>
  <component v-if="!loading" :is="currentRoute" @close="handleClose" @swap="handleSwap" />
</template>

<script lang="ts">
import { Component, Mixins, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import AddAsset from './components/AddAsset.vue'
import Wallet from './components/Wallet.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import WalletConnection from './components/WalletConnection.vue'
import WalletCreation from './components/WalletCreation.vue'
import WalletImport from './components/WalletImport.vue'
import WalletSend from './components/WalletSend.vue'
import WalletSettings from './components/WalletSettings.vue'
import WalletSettingsAbout from './components/SettingsAbout.vue'
import WalletSettingsLanguage from './components/SettingsLanguage.vue'
import WalletSettingsNetworks from './components/SettingsNetworks.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'

import LoadingMixin from './components/mixins/LoadingMixin'

import { RouteNames } from './consts'
import { dexApi } from './api'

@Component({
  components: {
    WalletConnection,
    WalletCreation,
    WalletImport,
    WalletSend,
    WalletSettings,
    WalletSettingsLanguage,
    WalletSettingsNetworks,
    WalletSettingsAbout,
    Wallet,
    WalletAssetDetails,
    AddAsset,
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
}
</script>
