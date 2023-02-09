<template>
  <wallet-base
    :title="t('connection.title')"
    :show-back="!isEntryView"
    :reset-focus="`${isEntryView}${step}`"
    @back="handleBackClick"
    v-loading="loading"
  >
    <template v-if="isLoggedIn" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleLogout">
        <s-icon name="basic-eye-24" size="28" />
      </s-button>
    </template>

    <div class="wallet-connection">
      <template v-if="!loading">
        <p class="wallet-connection-text">{{ connectionText }}</p>

        <template v-if="isEntryView || isUnableToSelectAccount">
          <s-button
            class="wallet-connection-action s-typography-button--large action-btn"
            type="primary"
            :loading="loading"
            @click="handleActionClick"
          >
            {{ t(actionButtonText) }}
          </s-button>
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

        <extension-list v-else-if="isExtensionsView" @select="handleSelectWallet" />

        <account-list v-else-if="isAccountListView" @select="handleSelectAccount" />
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
  Third = 3,
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

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.isAccountSwitch) {
        this.navigateToExtensionsList();
      }
    });
  }

  get isAccountSwitch(): boolean {
    return !!this.currentRouteParams.isAccountSwitch;
  }

  get isEntryView(): boolean {
    return this.step === Step.First;
  }

  get isExtensionsView(): boolean {
    return this.step === Step.Second;
  }

  get isAccountListView(): boolean {
    return this.step === Step.Third;
  }

  get isUnableToSelectAccount(): boolean {
    return this.isAccountListView && !this.polkadotJsAccounts.length;
  }

  get actionButtonText(): string {
    if (this.isUnableToSelectAccount) {
      return 'connection.action.refresh';
    }
    return 'connection.action.connect';
  }

  get connectionText(): string {
    if (this.isEntryView) {
      return this.t('connection.text', {
        extensions: this.availableWallets.map(({ title }) => title).join(', '),
      });
    }
    if (this.isExtensionsView) return this.t('connection.selectWallet');
    if (this.polkadotJsAccounts.length) return this.t('connection.selectAccount');

    return this.t('connection.noAccounts', { extension: this.selectedWalletTitle });
  }

  async handleActionClick(): Promise<void> {
    if (this.isUnableToSelectAccount) {
      window.history.go();
      return;
    }
    this.navigateToExtensionsList();
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account);
      } catch (error) {
        this.showAlert(error);
        this.navigateToEntry();
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

  private navigateToEntry(): void {
    this.step = Step.First;
  }

  private navigateToExtensionsList(): void {
    this.step = Step.Second;
  }

  private navigateToAccountList(): void {
    this.step = Step.Third;
  }

  handleLearnMoreClick(): void {
    this.$emit('learn-more');
  }

  handleBackClick(): void {
    if (this.isAccountListView) {
      this.navigateToExtensionsList();
    } else if (this.isExtensionsView && this.isLoggedIn) {
      this.navigate({ name: RouteNames.Wallet });
    } else {
      this.navigateToEntry();
    }
  }

  handleLogout(): void {
    this.navigateToEntry();
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
  // Margin and padding are set for the loader
  margin: calc(var(--s-basic-spacing) * -1);
  min-height: 204px;
  padding: var(--s-basic-spacing);
  & > *:not(:first-child) {
    margin-top: $basic-spacing-medium;
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
