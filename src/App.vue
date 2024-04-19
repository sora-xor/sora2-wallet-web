<template>
  <s-design-system-provider :value="libraryDesignSystem" id="app">
    <div class="buttons">
      <s-button class="theme-switch" @click="changeTheme">{{ libraryTheme }} theme</s-button>
      <s-button class="theme-switch" @click="changeIndexer">{{ indexerType }} indexer</s-button>
      <s-button class="theme-switch" @click="changeCeresFiatUsage">CERES fiat:{{ ceresFiatValuesUsage }}</s-button>
      <s-button class="hide-balance-switch" @click="toggleHideBalance">
        {{ shouldBalanceBeHidden ? 'hidden' : 'visible' }} balances
      </s-button>

      <select v-model="appCurrency">
        <option v-for="(rate, key) in fiatExchangeRateObject" :key="key" :value="key">{{ key }}</option>
      </select>
    </div>
    <div class="wallet-wrapper s-flex">
      <sora-wallet />
    </div>
    <confirm-dialog />
  </s-design-system-provider>
</template>

<script lang="ts">
// This file is only for local usage

import { FPNumber, HistoryItem } from '@sora-substrate/util';
import { switchTheme } from '@soramitsu-ui/ui-vue2/lib/utils';
import { Component, Mixins, Watch } from 'vue-property-decorator';

import env from '../public/env.json';

import ConfirmDialog from './components/ConfirmDialog.vue';
import TransactionMixin from './components/mixins/TransactionMixin';
import { SoraNetwork, IndexerType } from './consts';
import SoraWallet from './SoraWallet.vue';
import { state, mutation, getter, action } from './store/decorators';

import { initWallet } from './index';

import type { ApiKeysObject } from './types/common';
import type { Currency } from './types/currency';
import type { WhitelistArrayItem } from '@sora-substrate/util/build/assets/types';
import type DesignSystem from '@soramitsu-ui/ui-vue2/lib/types/DesignSystem';
import type Theme from '@soramitsu-ui/ui-vue2/lib/types/Theme';

@Component({
  components: { SoraWallet, ConfirmDialog },
})
export default class App extends Mixins(TransactionMixin) {
  @state.account.assetsToNotifyQueue assetsToNotifyQueue!: Array<WhitelistArrayItem>;
  @state.settings.indexerType indexerType!: IndexerType;
  @state.account.ceresFiatValuesUsage ceresFiatValuesUsage!: boolean;
  @getter.transactions.firstReadyTx firstReadyTransaction!: Nullable<HistoryItem>;
  @getter.libraryDesignSystem libraryDesignSystem!: DesignSystem;
  @getter.libraryTheme libraryTheme!: Theme;

  @mutation.settings.setSoraNetwork private setSoraNetwork!: (network: SoraNetwork) => void;
  @mutation.settings.setIndexerEndpoint private setIndexerEndpoint!: (options: {
    indexer: IndexerType;
    endpoint: string;
  }) => void;

  @mutation.settings.toggleHideBalance toggleHideBalance!: FnWithoutArgs;
  @action.account.useCeresApiForFiatValues private useCeresApiForFiatValues!: (flag: boolean) => void;
  @action.settings.selectIndexer private selectIndexer!: (IndexerType: IndexerType) => void;
  @action.settings.setApiKeys private setApiKeys!: (apiKeys: ApiKeysObject) => Promise<void>;
  @action.subscriptions.resetNetworkSubscriptions private resetNetworkSubscriptions!: AsyncFnWithoutArgs;
  @action.subscriptions.resetInternalSubscriptions private resetInternalSubscriptions!: AsyncFnWithoutArgs;
  @action.account.notifyOnDeposit private notifyOnDeposit!: (info: {
    asset: WhitelistArrayItem;
    message: string;
  }) => Promise<void>;

  @state.settings.currency currency!: Currency;
  @state.settings.fiatExchangeRateObject fiatExchangeRateObject!: Record<Currency, number>;
  @mutation.settings.setFiatCurrency setFiatCurrency!: (currency: Currency) => void;
  @action.settings.subscribeOnExchangeRatesApi private subscribeOnExchangeRatesApi!: AsyncFnWithoutArgs;

  async created(): Promise<void> {
    await this.setApiKeys(env.API_KEYS);
    this.setIndexerEndpoint({ indexer: IndexerType.SUBQUERY, endpoint: env.SUBQUERY_ENDPOINT });
    this.setIndexerEndpoint({ indexer: IndexerType.SUBSQUID, endpoint: env.SUBSQUID_ENDPOINT });
    this.setSoraNetwork(SoraNetwork.Dev);
    await initWallet({ withoutStore: true, appName: 'APP NAME HERE' }); // We don't need storage for local development
    await this.subscribeOnExchangeRatesApi();
    const localeLanguage = navigator.language;
    FPNumber.DELIMITERS_CONFIG.thousand = Number(1000).toLocaleString(localeLanguage).substring(1, 2);
    FPNumber.DELIMITERS_CONFIG.decimal = Number(1.1).toLocaleString(localeLanguage).substring(1, 2);
  }

  @Watch('assetsToNotifyQueue')
  private handleNotifyOnDeposit(whitelistAssetArray: WhitelistArrayItem[]): void {
    if (!whitelistAssetArray.length) return;
    if ('Notification' in window) {
      this.notifyOnDeposit({ asset: whitelistAssetArray[0], message: this.t('assetDeposit') });
    }
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

  changeIndexer() {
    this.selectIndexer(this.indexerType === IndexerType.SUBSQUID ? IndexerType.SUBQUERY : IndexerType.SUBSQUID);
  }

  changeCeresFiatUsage() {
    this.useCeresApiForFiatValues(!this.ceresFiatValuesUsage);
  }

  get appCurrency() {
    return this.currency;
  }

  set appCurrency(value) {
    this.setFiatCurrency(value);
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
  margin: 40px auto;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.buttons {
  display: flex;
  justify-content: space-between;
}
.theme-switch,
.hide-balance-switch {
  width: 185px;
  margin: 10px;
}
</style>
