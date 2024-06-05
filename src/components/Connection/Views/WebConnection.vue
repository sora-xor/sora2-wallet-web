<template>
  <wallet-base
    :title="t('account.accountTitle')"
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
            <p class="wallet-connection-title">{{ t('connection.list.integrated') }}</p>
            <extension-connection-list
              :wallets="wallets.internal"
              :connected-wallet="source"
              :selected-wallet="selectedWallet"
              :selected-wallet-loading="selectedWalletLoading"
              @select="handleSelectWallet"
            />
          </div>
          <div v-if="wallets.external.length" class="wallet-connection-list">
            <p class="wallet-connection-title">{{ t('connection.list.extensions') }}</p>
            <extension-connection-list
              :wallets="wallets.external"
              :connected-wallet="source"
              :selected-wallet="selectedWallet"
              :selected-wallet-loading="selectedWalletLoading"
              @select="handleSelectWallet"
            />
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

          <account-connection-list
            v-else
            :accounts="polkadotJsAccounts"
            :wallet="selectedWallet"
            :is-connected="isConnectedAccount"
            @select="handleSelectAccount"
          />
        </template>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { RouteNames, AppWallet } from '../../../consts';
import { state, action, getter, mutation } from '../../../store/decorators';
import { isInternalWallet } from '../../../util/account';
import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import WalletBase from '../../WalletBase.vue';
import AccountConnectionList from '../List/Account.vue';
import ExtensionConnectionList from '../List/Extension.vue';

import type { Route } from '../../../store/router/types';
import type { PolkadotJsAccount } from '../../../types/common';
import type { Wallet } from '@sora-test/wallet-connect/types';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: { WalletBase, AccountConnectionList, ExtensionConnectionList },
})
export default class WebConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step = Step.First;

  @getter.account.isConnectedAccount public isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  @state.account.source public source!: string;
  @state.account.polkadotJsAccounts public polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.selectedWallet public selectedWallet!: AppWallet;
  @state.account.selectedWalletLoading public selectedWalletLoading!: boolean;

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
