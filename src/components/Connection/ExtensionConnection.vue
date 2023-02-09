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
          <extension-list @select="handleSelectWallet" />

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
import WalletBase from '../WalletBase.vue';
import AccountList from './AccountList.vue';
import AccountCard from '../AccountCard.vue';
import ExtensionList from './ExtensionList.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import { state, action, getter, mutation } from '../../store/decorators';
import { AppError } from '../../util';
import { RouteNames } from '../../consts';
import type { Wallet } from '@subwallet/wallet-connect/types';
import type { Extensions } from '../../consts';
import type { PolkadotJsAccount } from '../../types/common';
import type { Route } from '../../store/router/types';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: { AccountCard, WalletBase, AccountList, ExtensionList },
})
export default class ExtensionConnection extends Mixins(TranslationMixin, LoadingMixin) {
  step = Step.First;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<boolean>>;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.availableWallets availableWallets!: Array<Wallet>;

  @getter.account.selectedWalletTitle private selectedWalletTitle!: string;
  @getter.account.isLoggedIn isLoggedIn!: boolean;

  @action.account.importPolkadotJs private importPolkadotJs!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.selectExtension private selectExtension!: (extension: Extensions) => Promise<void>;
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
      return this.t('connection.text', {
        extensions: this.availableWallets.map(({ title }) => title).join(', '),
      });
    }

    if (this.noAccounts) {
      return this.t('connection.noAccounts', { extension: this.selectedWalletTitle });
    }

    return this.t('connection.selectAccount');
  }

  async handleRefreshClick(): Promise<void> {
    window.history.go();
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account);
      } catch (error) {
        this.showAlert(error);
        this.navigateToExtensionsList();
      }
    });
  }

  async handleSelectWallet(wallet: Wallet): Promise<void> {
    if (!wallet.installed) return;
    try {
      await this.selectExtension(wallet.extensionName as Extensions);
      this.navigateToAccountList();
    } catch (error) {
      this.showAlert(error);
    }
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

  private showAlert(error: unknown): void {
    const message =
      error instanceof AppError
        ? this.t(error.translationKey, error.translationPayload)
        : this.t((error as Error).message);
    this.$alert(message, this.t('errorText'));
  }
}
</script>

<style scoped lang="scss">
.wallet-connection {
  & > *:not(:first-child) {
    margin-top: $basic-spacing-big;
  }

  &-text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }

  &-action {
    width: 100%;

    & + & {
      margin-left: 0;
    }
  }
}
</style>
