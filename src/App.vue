<template>
  <div id="app">
    <div class="wallet-wrapper s-flex">
      <sora-neo-wallet />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Mixins } from 'vue-property-decorator'

import SoraNeoWallet from './SoraNeoWallet.vue'
import { initWallet } from './index'

@Component({
  components: { SoraNeoWallet }
})
export default class App extends Vue {
  created (): void {
    const withoutExternalStore = true
    initWallet(withoutExternalStore) // We don't need storage for local development
  }
}
</script>

<style lang="scss">
.el-tooltip__popper.info-tooltip {
  padding: $basic-spacing_mini;
  max-width: 320px;
  border: none !important;
  box-shadow: var(--s-shadow-tooltip);
  font-size: var(--s-font-size-small);
  line-height: $line-height_small;
}
</style>

<style scoped lang="scss">
.wallet-wrapper {
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
