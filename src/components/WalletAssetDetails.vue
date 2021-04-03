<template>
  <wallet-base
    :title="currentRouteParams.asset.symbol"
    show-back
    show-clean-history
    :show-action="!isXor"
    action-icon="basic-eye-24"
    action-tooltip="asset.remove"
    :disabled-clean-history="isCleanHistoryDisabled"
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
import { KnownAssets, KnownSymbols, History } from '@sora-substrate/util'

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
  @Getter activity!: Array<History | any>
  @Action navigate
  @Action getAccountActivity

  get asset (): History | any {
    return this.currentRouteParams && this.currentRouteParams.asset
  }

  get assetAddress (): string {
    return this.asset ? this.asset.address : ''
  }

  get isXor (): boolean {
    const asset = KnownAssets.get(this.assetAddress)
    return asset && asset.symbol === KnownSymbols.XOR
  }

  get isCleanHistoryDisabled (): boolean {
    return !this.asset ? true : !this.activity.filter(item => [item.assetAddress, item.asset2Address].includes(this.assetAddress)).length
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleRemoveAsset (): void {
    const accountAssets = api.accountAssets
    api.removeAsset(this.assetAddress)
    this.handleBack()
  }

  handleCleanHistory (): void {
    if (!this.asset) return
    api.clearHistory(this.assetAddress)
    this.getAccountActivity()
  }
}
</script>
