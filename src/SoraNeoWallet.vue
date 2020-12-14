<template>
  <component v-if="!loading" :is="currentRoute" @close="handleClose" @swap="handleSwap" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import AddToken from './components/AddToken.vue'
import Wallet from './components/Wallet.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import WalletConnection from './components/WalletConnection.vue'
import WalletCreation from './components/WalletCreation.vue'
import WalletImport from './components/WalletImport.vue'
import WalletSettings from './components/WalletSettings.vue'
import WalletSettingsAbout from './components/SettingsAbout.vue'
import WalletSettingsLanguage from './components/SettingsLanguage.vue'
import WalletSettingsNetworks from './components/SettingsNetworks.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'

import { RouteNames } from './consts'
import { dexApi } from './api'

@Component({
  components: {
    WalletConnection,
    WalletCreation,
    WalletImport,
    WalletSettings,
    WalletSettingsLanguage,
    WalletSettingsNetworks,
    WalletSettingsAbout,
    Wallet,
    WalletAssetDetails,
    AddToken,
    WalletTransactionDetails
  }
})
export default class SoraNeoWallet extends Vue {
  @Getter currentRoute!: RouteNames
  @Getter isLoggedIn!: boolean
  @Action navigate

  loading = false

  async created (): Promise<void> {
    try {
      this.loading = true
      if (!(dexApi.api && dexApi.api.isConnected)) {
        await dexApi.initialize()
        console.info('Connected to blockchain', dexApi.endpoint)
      }
    } catch (error) {
      console.error(error)
    } finally {
      this.loading = false
    }
  }

  mounted (): void {
    if (this.isLoggedIn) {
      this.navigate({ name: RouteNames.Wallet })
    }
  }

  handleClose (): void {
    this.$emit('close')
  }

  handleSwap (token: any): void {
    this.$emit('swap', token)
  }
}
</script>
