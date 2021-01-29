<template>
  <!-- TODO: Add more button -->
  <wallet-base :title="currentRouteParams.symbol" show-back @back="handleBack">
    <wallet-history :history="history" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletHistory from './WalletHistory.vue'
import { RouteNames } from '../consts'

@Component({
  components: { WalletBase, WalletHistory }
})
export default class WalletAssetDetails extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any
  @Getter selectedAssetDetails!: Array<any>
  @Action navigate
  @Action getAssetDetails

  mounted (): void {
    this.getAssetDetails({ symbol: this.currentRouteParams.symbol })
  }

  get history (): Array<any> {
    if (!this.selectedAssetDetails) {
      return []
    }
    return this.selectedAssetDetails.map(item => ({ ...item, fromSymbol: this.currentRouteParams.symbol }))
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>
