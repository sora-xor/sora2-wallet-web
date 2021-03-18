<template>
  <wallet-base :title="t('wallet.title')" show-settings>
    <wallet-account show-menu :name="account.name" />
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
import { WalletTabs } from '../consts'

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

  currentTab = WalletTabs.Assets

  handleChangeTab (value: WalletTabs): void {
    this.currentTab = value
  }

  handleSwap (asset: any): void {
    this.$emit('swap', asset)
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
