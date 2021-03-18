<template>
  <wallet-base
    :title="currentRouteParams.asset.symbol"
    show-back
    show-action
    action-icon="delete"
    action-tooltip=""
    @back="handleBack"
    @action="handleRemoveAsset"
  >
    <wallet-history :history="history" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { api } from '../api'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletHistory from './WalletHistory.vue'
import { RouteNames } from '../consts'
import { storage } from '../util/storage'

@Component({
  components: { WalletBase, WalletHistory }
})
export default class WalletAssetDetails extends Mixins(TranslationMixin) {
  @Getter currentRouteParams!: any
  @Getter selectedAssetDetails!: Array<any>
  @Action navigate
  @Action getAssetDetails

  mounted (): void {
    // this.getAssetDetails({ address: this.currentRouteParams.asset.symbol })
  }

  get history (): Array<any> {
    if (!this.selectedAssetDetails) {
      return []
    }
    return this.selectedAssetDetails.map(item => ({ ...item, fromSymbol: this.currentRouteParams.asset.symbol }))
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleRemoveAsset (): void {
    const accountAssets = api.accountAssets
    api.removeAsset(this.currentRouteParams.asset.address)
    this.handleBack()
  }
}
</script>
