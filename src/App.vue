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

import { FPNumber, HistoryItem } from '@sora-substrate/util';
import { switchTheme } from '@soramitsu/soramitsu-js-ui/lib/utils';
import type Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import type DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';

import env from '../public/env.json';

import TransactionMixin from './components/mixins/TransactionMixin';
import { initWallet } from './index';
import SoraWallet from './SoraWallet.vue';
import { SoraNetwork } from './consts';
import { state, mutation, getter, action } from './store/decorators';
import type { ApiKeysObject } from './types/common';
import { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';

@Component({
  components: { SoraWallet },
})
export default class App extends Mixins(TransactionMixin) {
  @state.settings.shouldBalanceBeHidden shouldBalanceBeHidden!: boolean;
  @state.account.assetsToNotifyQueue assetsToNotifyQueue!: Array<WhitelistArrayItem>;
  @getter.transactions.firstReadyTx firstReadyTransaction!: Nullable<HistoryItem>;
  @getter.libraryDesignSystem libraryDesignSystem!: DesignSystem;
  @getter.libraryTheme libraryTheme!: Theme;

  @mutation.settings.toggleHideBalance toggleHideBalance!: VoidFn;
  @mutation.settings.setSoraNetwork private setSoraNetwork!: (network: SoraNetwork) => void;
  @mutation.settings.setSubqueryEndpoint private setSubqueryEndpoint!: (endpoint: string) => void;
  @action.settings.setApiKeys private setApiKeys!: (apiKeys: ApiKeysObject) => Promise<void>;
  @action.subscriptions.resetNetworkSubscriptions private resetNetworkSubscriptions!: AsyncVoidFn;
  @action.subscriptions.resetInternalSubscriptions private resetInternalSubscriptions!: AsyncVoidFn;
  @action.account.notifyOnDeposit private notifyOnDeposit!: (data) => AsyncVoidFn;

  async created(): Promise<void> {
    await this.setApiKeys(env.API_KEYS);
    this.setSubqueryEndpoint(env.SUBQUERY_ENDPOINT);
    this.setSoraNetwork(SoraNetwork.Dev);
    await initWallet({ withoutStore: true, whiteListOverApi: true }); // We don't need storage for local development
    const localeLanguage = navigator.language;
    FPNumber.DELIMITERS_CONFIG.thousand = Number(1000).toLocaleString(localeLanguage).substring(1, 2);
    FPNumber.DELIMITERS_CONFIG.decimal = Number(1.1).toLocaleString(localeLanguage).substring(1, 2);
  }

  @Watch('assetsToNotifyQueue')
  private handleNotifyOnDeposit(data): void {
    if (!data.length) return;
    this.notifyOnDeposit({ asset: data[0], message: this.t('assetDeposit') });
  }

  @Watch('firstReadyTransaction', { deep: true })
  private handleNotifyAboutTransaction(value: HistoryItem, oldValue: HistoryItem): void {
    this.handleChangeTransaction(value, oldValue);
  }

  beforeDestroy(): void {
    this.resetNetworkSubscriptions();
    this.resetInternalSubscriptions();
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
