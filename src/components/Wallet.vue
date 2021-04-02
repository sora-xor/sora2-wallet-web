<template>
  <wallet-base
    :title="t('wallet.title')"
    show-action
    :show-clean-history="currentTab === WalletTabs.Activity"
    action-icon="various-atom-24"
    action-tooltip="wallet.createToken"
    @action="handleCreateToken"
    @cleanHistory="handleCleanHistory"
  >
    <wallet-account show-controls />
    <div class="wallet">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in WalletTabs"
          :key="tab"
          :label="t(`wallet.${tab}`)"
          :name="tab"
        />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import WalletAssets from './WalletAssets.vue'
import WalletActivity from './WalletActivity.vue'
import { RouteNames, WalletTabs } from '../consts'

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity
  }
})
export default class Wallet extends Mixins(TranslationMixin) {
  readonly WalletTabs = WalletTabs

  @Getter account!: any
  @Action navigate

  currentTab = WalletTabs.Assets

  handleChangeTab (value: WalletTabs): void {
    this.currentTab = value
  }

  handleSwap (asset: any): void {
    this.$emit('swap', asset)
  }

  handleCreateToken (): void {
    this.navigate({ name: RouteNames.CreateToken })
  }

  handleCleanHistory (): void {
    // TODO: Add remove method from api
    console.log('Clean history without Bridge history')
  }
}
</script>

<style lang="scss">
.wallet {
  @include custom-tabs;
}
</style>

<style scoped lang="scss">
.wallet {
  margin-top: $basic-spacing;
}
</style>
