<template>
  <wallet-base :title="t('settings.title')" show-back @back="handleBack">
    <div class="wallet-settings">
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import { RouteNames } from '../consts'

@Component({
  components: { WalletBase }
})
export default class WalletSettings extends Mixins(TranslationMixin) {
  @Action navigate

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }
}
</script>

<style scoped lang="scss">
</style>
