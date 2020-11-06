<template>
  <wallet-base :title="t('wallet.title')" show-settings @settings="handleOpenSettings">
    <wallet-account show-menu :name="account.name" />
    <div class="wallet">
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import { RouteNames, WalletTabs } from '../consts'

@Component({
  components: { WalletBase, WalletAccount }
})
export default class Wallet extends Mixins(TranslationMixin) {
  readonly WalletTabs = WalletTabs

  @Getter account!: any
  @Action navigate

  handleOpenSettings (): void {
    this.navigate({ name: RouteNames.WalletSettings })
  }
}
</script>

<style scoped lang="scss">
</style>
