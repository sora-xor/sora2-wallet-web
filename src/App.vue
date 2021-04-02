<template>
  <div id="app">
    <div class="wallet-wrapper s-flex">
      <sora-neo-wallet />
    </div>
  </div>
</template>

<script lang="ts">
// This file is only for local usage
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TransactionMixin from './components/mixins/TransactionMixin'
import { initWallet } from './index'
import SoraNeoWallet from './SoraNeoWallet.vue'

@Component({
  components: { SoraNeoWallet }
})
export default class App extends Mixins(TransactionMixin) {
  @Getter firstReadyTransaction!: any
  @Action trackActiveTransactions

  async created (): Promise<void> {
    initWallet({ withoutStore: true }) // We don't need storage for local development
    this.trackActiveTransactions()
  }

  @Watch('firstReadyTransaction', { deep: true })
  private handleNotifyAboutTransaction (value): void {
    this.handleChangeTransaction(value)
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
  line-height: var(--s-line-height-medium);
}
.el-notification.sora {
  background: var(--s-color-brand-day);
  box-shadow: var(--s-shadow-tooltip);
  border-radius: calc(var(--s-border-radius-mini) / 2);
  border: none;
  align-items: center;
  width: 405px;
  .el-notification {
    &__icon {
      position: relative;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--s-color-utility-surface);
      &:before {
        position: absolute;
        top: -2px;
        left: -2px;
      }
    }
    &__content {
      color: var(--s-color-utility-surface);
      text-align: left;
    }
    &__closeBtn {
      color: var(--s-color-utility-surface);
      &:hover {
        color: var(--s-color-utility-surface);
      }
    }
  }
  .loader {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--s-color-utility-surface);
    // If duration will be change we should create css variable for it
    animation: runloader 4.5s linear infinite;
    @keyframes runloader {
      0% {
        width: 0;
      }
      100% {
        width: 100%;
      }
    }
  }
  &:hover .loader {
    width: 0;
    animation: none;
  }
}
</style>

<style scoped lang="scss">
.wallet-wrapper {
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
