<template>
  <div id="app">
    <div class="wallet-wrapper s-flex">
      <wallet />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Mixins } from 'vue-property-decorator'

import { lazyComponent } from '@/util'

@Component({
  components: {
    Wallet: lazyComponent('Wallet')
  }
})
export default class App extends Vue {
}
</script>

<style scoped lang="scss">
.wallet-wrapper {
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
