<template>
  <component :is="currentRoute" />
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './components/mixins/TranslationMixin'
import WalletConnection from './components/WalletConnection.vue'
import WalletCreation from './components/WalletCreation.vue'
import WalletImport from './components/WalletImport.vue'

import WalletSettings from './components/WalletSettings.vue'
import WalletSettingsLanguage from './components/settings/SettingsLanguage.vue'
import WalletSettingsNetworks from './components/settings/SettingsNetworks.vue'
import WalletSettingsAbout from './components/settings/SettingsAbout.vue'
import WalletAssetDetails from './components/WalletAssetDetails.vue'
import AddToken from './components/AddToken.vue'
import Wallet from './components/Wallet.vue'
import WalletTransactionDetails from './components/WalletTransactionDetails.vue'
import { RouteNames } from './consts'

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
  readonly RouteNames = RouteNames

  @Getter currentRoute!: RouteNames
  @Getter isLoggedIn!: boolean
  @Action navigate

  mounted (): void {
    if (this.isLoggedIn) {
      this.navigate({ name: RouteNames.Wallet })
    }
  }
}
</script>
