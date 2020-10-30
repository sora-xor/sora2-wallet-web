<template>
  <div>
    <wallet-connection v-if="currentRoute === RouteNames.WalletConnection" />
    <wallet-creation v-if="currentRoute === RouteNames.WalletCreation" />
    <wallet-import v-if="currentRoute === RouteNames.WalletImport" />
    <wallet-settings v-if="currentRoute === RouteNames.WalletSettings" />
    <wallet v-if="currentRoute === RouteNames.Wallet" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TranslationMixin from './components/mixins/TranslationMixin'
import WalletConnection from './components/WalletConnection.vue'
import WalletCreation from './components/WalletCreation/WalletCreation.vue'
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
}
</script>
