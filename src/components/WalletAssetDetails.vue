<template>
  <wallet-base
    :title="currentRouteParams.asset.symbol"
    show-back
    show-clean-history
    :show-action="!isXor"
    action-icon="basic-eye-24"
    action-tooltip="asset.remove"
    @back="handleBack"
    @action="handleRemoveAsset"
    @cleanHistory="handleCleanHistory"
  >
    <wallet-history :assetAddress="currentRouteParams.asset.address" />
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { KnownAssets, KnownSymbols } from '@sora-substrate/util'

import { api } from '../api'
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

  get isXor (): boolean {
    const asset = KnownAssets.get(this.currentRouteParams.asset.address)
    return asset && asset.symbol === KnownSymbols.XOR
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleRemoveAsset (): void {
    const accountAssets = api.accountAssets
    api.removeAsset(this.currentRouteParams.asset.address)
    this.handleBack()
  }

  handleCleanHistory (): void {
    // TODO: Add remove method from api
    console.log('Clean asset\'s history without Bridge history')
  }
}
</script>
