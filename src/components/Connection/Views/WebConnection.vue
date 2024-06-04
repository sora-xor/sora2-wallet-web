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

    <extension-list-step
      v-if="isExtensionsView"
      :connected-wallet="source"
      :selected-wallet="selectedWallet"
      :selected-wallet-loading="selectedWalletLoading"
      :internal-wallets="wallets.internal"
      :external-wallets="wallets.external"
      @select="handleSelectWallet"
      @learn-more="handleLearnMore"
    />

    <account-list-step v-else :text="connectionText" @select="handleSelectAccount" />
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
import AccountListStep from '../Step/AccountList.vue';
import ExtensionListStep from '../Step/ExtensionList.vue';

import type { Route } from '../../../store/router/types';
import type { PolkadotJsAccount } from '../../../types/common';
import type { Wallet } from '@sora-test/wallet-connect/types';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: {
    WalletBase,
    AccountListStep,
    ExtensionListStep,
  },
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
    if (this.noAccounts) {
      return this.t('connection.noAccounts', { extension: this.selectedWalletTitle });
    }

    return this.t('connection.selectAccount');
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

  handleLearnMore(): void {
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
