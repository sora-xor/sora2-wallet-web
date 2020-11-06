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
import Wallet from './components/Wallet.vue'
import { RouteNames } from './consts'

@Component({
  components: {
    WalletConnection,
    WalletCreation,
    WalletImport,
    WalletSettings,
    Wallet
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
