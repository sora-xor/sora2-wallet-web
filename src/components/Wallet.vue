<template>
  <div>
    <wallet-connection v-if="currentRoute === RouteNames.WalletConnection" />
    <wallet-creation v-if="currentRoute === RouteNames.WalletCreation" />
    <wallet-import v-if="currentRoute === RouteNames.WalletImport" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletConnection from './WalletConnection.vue'
import WalletCreation from './WalletCreation/WalletCreation.vue'
import WalletImport from './WalletImport.vue'
import { RouteNames } from '../consts'

@Component({
  components: {
    WalletConnection,
    WalletCreation,
    WalletImport
  }
})
export default class Wallet extends Vue {
  readonly RouteNames = RouteNames

  @Getter currentRoute!: RouteNames
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/variables';
@import '../styles/colors';
@import '../styles/layout';

</style>
