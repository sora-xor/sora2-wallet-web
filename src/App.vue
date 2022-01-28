<template>
  <s-design-system-provider :value="libraryDesignSystem" id="app" class="app-wrapper">
    <s-button class="theme-switch" @click="changeTheme">{{ libraryTheme }} theme</s-button>
    <div class="wallet-wrapper s-flex">
      <sora-wallet />
    </div>
    <s-button class="hide-balance-switch" @click="toggleHideBalance">
      {{ shouldBalanceBeHidden ? 'hidden' : 'visible' }} balances
    </s-button>
  </s-design-system-provider>
</template>

<script lang="ts">
// This file is only for local usage
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';

import { FPNumber, History } from '@sora-substrate/util';
import { switchTheme } from '@soramitsu/soramitsu-js-ui/lib/utils';
import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import type DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';

import TransactionMixin from './components/mixins/TransactionMixin';
import { initWallet } from './index';
import SoraWallet from './SoraWallet.vue';
import { SoraNetwork, NFT_STORAGE_API_KEY } from './consts';
import { ApiKeysObject } from './types/common';

@Component({
  components: { SoraWallet },
})
export default class App extends Mixins(TransactionMixin) {
  @Getter shouldBalanceBeHidden!: boolean;
  @Action toggleHideBalance!: AsyncVoidFn;

  @Getter libraryDesignSystem!: DesignSystem;
  @Getter libraryTheme!: Theme;
  @Getter firstReadyTransaction!: Nullable<History>;

  @Action trackActiveTransactions!: AsyncVoidFn;
  @Action resetActiveTransactions!: AsyncVoidFn;
  @Action resetAccountAssetsSubscription!: AsyncVoidFn;
  @Action resetRuntimeVersionSubscription!: AsyncVoidFn;
  @Action resetFiatPriceAndApySubscription!: AsyncVoidFn;
  @Action setApiKeys!: (apiKeys: ApiKeysObject) => AsyncVoidFn;
  @Action setSoraNetwork!: (network: SoraNetwork) => Promise<void>;

  async created(): Promise<void> {
    await this.setApiKeys({ nftStorage: NFT_STORAGE_API_KEY });
    await this.setSoraNetwork(SoraNetwork.Dev);
    await initWallet({ withoutStore: true, whiteListOverApi: true }); // We don't need storage for local development
    this.trackActiveTransactions();
    const localeLanguage = navigator.language;
    FPNumber.DELIMITERS_CONFIG.thousand = Number(1000).toLocaleString(localeLanguage).substring(1, 2);
    FPNumber.DELIMITERS_CONFIG.decimal = Number(1.1).toLocaleString(localeLanguage).substring(1, 2);
  }

  @Watch('firstReadyTransaction', { deep: true })
  private handleNotifyAboutTransaction(value: History): void {
    this.handleChangeTransaction(value);
  }

  beforeDestroy(): void {
    this.resetActiveTransactions();
    this.resetAccountAssetsSubscription();
    this.resetRuntimeVersionSubscription();
    this.resetFiatPriceAndApySubscription();
  }

  changeTheme(): void {
    switchTheme();
  }
}
</script>

<style lang="scss">
html {
  background: var(--s-color-utility-surface);
}
.el-tooltip__popper.info-tooltip {
  padding: var(--s-basic-spacing);
  max-width: 320px;
  border: none !important;
  box-shadow: var(--s-shadow-tooltip);
  font-size: var(--s-font-size-small);
  line-height: var(--s-line-height-medium);
}
.el-loading-mask {
  background-color: var(--s-color-utility-body);
  .el-loading-spinner {
    background-image: url('~@/assets/img/pswap-loader.svg');
    height: var(--s-size-medium);
    width: var(--s-size-medium);
    margin-left: calc(50% - (var(--s-size-medium) / 2));
    > svg {
      display: none;
    }
  }
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
        width: 100%;
      }
      100% {
        width: 0;
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
  margin: 40px 0;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.app-wrapper {
  display: flex;
  justify-content: space-between;
}
.theme-switch,
.hide-balance-switch {
  width: 185px;
  margin: 10px;
}
</style>
