<template>
  <wallet-base
    :title="t('connection.title')"
    :show-back="isLoggedIn || isAccountListView"
    :reset-focus="`${isExtensionsView}${step}`"
    @back="handleBackClick"
    v-loading="loading"
    title-center
  >
    <template v-if="isLoggedIn" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleLogout">
        <s-icon name="basic-eye-24" size="28" />
      </s-button>
    </template>

    <div class="wallet-connection">
      <template v-if="!loading">
        <p class="wallet-connection-text">{{ connectionText }}</p>

        <template v-if="isExtensionsView">
          <div v-if="wallets.internal.length" class="wallet-connection-list">
            <p class="wallet-connection-title">{{ t('connection.list.simplest') }}</p>
            <extension-list :wallets="wallets.internal" @select="handleSelectWallet" />
          </div>
          <div v-if="wallets.external.length" class="wallet-connection-list">
            <p class="wallet-connection-title">{{ t('connection.list.extensions') }}</p>
            <extension-list :wallets="wallets.external" @select="handleSelectWallet" />
          </div>

          <s-button
            class="wallet-connection-action s-typography-button--large learn-more-btn"
            type="tertiary"
            icon="question-circle-16"
            icon-position="right"
            @click="handleLearnMoreClick"
          >
            {{ t('connection.action.learnMore') }}
          </s-button>
        </template>

        <template v-else>
          <s-button
            v-if="noAccounts"
            class="wallet-connection-action s-typography-button--large action-btn"
            type="primary"
            :loading="loading"
            @click="handleRefreshClick"
          >
            {{ t('connection.action.refresh') }}
          </s-button>

          <account-list v-else @select="handleSelectAccount" />
        </template>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import type { Wallet } from '@subwallet/wallet-connect/types';

import WalletBase from '../../WalletBase.vue';
import AccountList from '../AccountList.vue';
import ExtensionList from '../ExtensionList.vue';

import NotificationMixin from '../../mixins/NotificationMixin';
import LoadingMixin from '../../mixins/LoadingMixin';

import { state, action, getter, mutation } from '../../../store/decorators';
import { RouteNames, AppWallet } from '../../../consts';
import { isInternalWallet } from '../../../consts/wallets';

import type { PolkadotJsAccount } from '../../../types/common';
import type { Route } from '../../../store/router/types';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: { WalletBase, AccountList, ExtensionList },
})
export default class WebConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step = Step.First;

  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @getter.account.wallets wallets!: { internal: Wallet[]; external: Wallet[] };
  @getter.account.selectedWalletTitle private selectedWalletTitle!: string;
  @getter.account.isLoggedIn isLoggedIn!: boolean;

  @action.account.loginAccount private loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.selectWallet private selectWallet!: (wallet: AppWallet) => Promise<void>;
  @action.account.logout private logout!: AsyncFnWithoutArgs;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  get isExtensionsView(): boolean {
    return this.step === Step.First;
  }

  get isAccountListView(): boolean {
    return this.step === Step.Second;
  }

  get noAccounts(): boolean {
    return !this.polkadotJsAccounts.length;
  }

  get connectionText(): string {
    if (this.isExtensionsView) {
      return this.t('connection.text');
    }

    if (this.noAccounts) {
      return this.t('connection.noAccounts', { extension: this.selectedWalletTitle });
    }

    return this.t('connection.selectAccount');
  }

  async handleRefreshClick(): Promise<void> {
    window.history.go();
  }

  async handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): Promise<void> {
    if (isConnected) {
      this.navigate({ name: RouteNames.Wallet });
    } else {
      await this.withLoading(async () => {
        await this.withAppAlert(async () => {
          await this.loginAccount(account);
        });
      });
    }
  }

  async handleSelectWallet(wallet: Wallet): Promise<void> {
    if (!wallet.installed) return;

    await this.withAppAlert(async () => {
      await this.selectWallet(wallet.extensionName as AppWallet);

      if (isInternalWallet(wallet)) {
        this.navigate({ name: RouteNames.InternalConnection });
      } else {
        this.navigateToAccountList();
      }
    });
  }

  private navigateToExtensionsList(): void {
    this.step = Step.First;
  }

  private navigateToAccountList(): void {
    this.step = Step.Second;
  }

  handleLearnMoreClick(): void {
    this.$emit('learn-more');
  }

  handleBackClick(): void {
    if (this.isAccountListView) {
      this.navigateToExtensionsList();
    } else if (this.isExtensionsView && this.isLoggedIn) {
      this.navigate({ name: RouteNames.Wallet });
    }
  }

  handleLogout(): void {
    this.navigateToExtensionsList();
    this.logout();
  }
}
</script>

<style scoped lang="scss">
.wallet-connection {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-big;
  min-height: 102px;

  &-text {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
  }

  &-title {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 600;
    line-height: var(--s-line-height-small);
    text-transform: uppercase;
  }

  &-action {
    width: 100%;

    & + & {
      margin-left: 0;
    }
  }

  &-list {
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing-small;
  }
}
</style>
