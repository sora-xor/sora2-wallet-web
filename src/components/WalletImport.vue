<template>
  <wallet-base title="Import" show-back @back="handleBack">
    <div class="wallet-creation">
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
export default class WalletImport extends Mixins(TranslationMixin) {
  @Action navigate

  handleBack (): void {
    this.navigate({ name: RouteNames.WalletConnection })
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/variables';
@import '../styles/colors';
@import '../styles/layout';

</style>
