<template>
  <component v-if="!loading" :is="currentRoute" @close="handleClose" @swap="handleSwap" />
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './components/mixins/TranslationMixin'
import WalletConnection from './components/WalletConnection.vue'
import WalletCreation from './components/WalletCreation.vue'
import WalletImport from './components/WalletImport.vue'
import WalletSettings from './components/WalletSettings.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import AddToken from './components/AddToken.vue'
import Wallet from './components/Wallet.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'
import { RouteNames } from './consts'
import { dexApi } from './api'

@Component({
  components: {
    WalletConnection,
    WalletCreation,
    WalletImport,
    WalletSettings,
    Wallet,
    WalletAssetDetails,
    AddToken,
    WalletTransactionDetails
  }
})
export default class SoraNeoWallet extends Vue {
  readonly RouteNames = RouteNames

  @Getter currentRoute!: RouteNames
  @Getter isLoggedIn!: boolean
  @Action navigate

  loading = false

  async created (): Promise<void> {
    try {
      this.loading = true
      await dexApi.initialize()
      console.info('Connected to blockchain', dexApi.endpoint)
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
