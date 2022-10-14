<template>
  <wallet-base
    :title="t('connection.title')"
    :show-back="!isEntryView"
    :reset-focus="`${isEntryView}${step}`"
    @back="handleBackClick"
  >
    <div class="wallet-connection" v-loading="loading">
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

        <div v-else-if="isExtensionsView" class="wallet-connection-extensions">
          <account-card
            v-button
            v-for="wallet in availableWallets"
            :key="wallet.extensionName"
            @click.native="handleSelectWallet(wallet)"
            class="wallet-connection-extension"
            tabindex="0"
          >
            <template #avatar>
              <img :src="wallet.logo.src" :alt="wallet.logo.alt" />
            </template>
            <template #name>{{ wallet.title }}</template>
            <template #default v-if="!wallet.installed">
              <a :href="getWalletInstallUrl(wallet)" target="_blank" rel="nofollow noopener noreferrer">
                <s-button size="small" tabindex="-1">{{ t('connection.wallet.install') }}</s-button>
              </a>
            </template>
          </account-card>
        </div>

        <s-scrollbar v-else-if="isAccountListView" class="wallet-connection-accounts">
          <wallet-account
            v-button
            v-for="(account, index) in polkadotJsAccounts"
            :key="index"
            :polkadotAccount="account"
            @click.native="handleSelectAccount(account)"
            class="wallet-connection-account"
            tabindex="0"
          />
        </s-scrollbar>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import WalletBase from '../WalletBase.vue';
import WalletAccount from '../WalletAccount.vue';
import AccountCard from '../AccountCard.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import { state, action } from '../../store/decorators';
import { AppError, getWalletInstallUrl } from '../../util';
import type { Wallet } from '@subwallet/wallet-connect/types';
import type { Extensions } from '../../consts';
import type { PolkadotJsAccount } from '../../types/common';

enum Step {
  First = 1,
  Second = 2,
  Third = 3,
}

@Component({
  components: { AccountCard, WalletBase, WalletAccount },
})
export default class ExtensionConnection extends Mixins(TranslationMixin, LoadingMixin) {
  readonly Step = Step;
  step = Step.First;

  readonly getWalletInstallUrl = getWalletInstallUrl;

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<boolean>>;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.availableWallets availableWallets!: Array<Wallet>;

  @action.account.importPolkadotJs private importPolkadotJs!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.selectExtension private selectExtension!: (extension: Extensions) => Promise<void>;

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
    if (this.isEntryView) return this.t('connection.text');
    if (this.isExtensionsView) return this.t('connection.selectWallet');
    return this.t(this.polkadotJsAccounts.length ? 'connection.selectAccount' : 'connection.noAccounts');
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
    } else if (this.isExtensionsView) {
      this.navigateToEntry();
    }
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

<style lang="scss">
$account-height: 60px;

.wallet-connection-accounts {
  @include scrollbar($basic-spacing-big);
}

.wallet-connection-extension.s-card.neumorphic.s-size-small {
  padding: calc(var(--s-basic-spacing) * 1.25) $basic-spacing-small;
}

.s-card.wallet-account.wallet-connection {
  &-account,
  &-extension {
    @include focus-outline($withOffset: true);
    &:hover {
      cursor: pointer;
      border-color: var(--s-color-base-content-secondary);
    }
  }
  &-extension a {
    @include focus-outline($borderRadius: var(--s-border-radius-small));
  }
}
</style>

<style scoped lang="scss">
$account-height: 60px;
$account-margin-bottom: var(--s-basic-spacing);
$accounts-padding: calc(#{$account-margin-bottom} / 2);
$accounts-number: 7;

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
  &-accounts {
    height: calc(
      calc(#{$account-height} + #{$account-margin-bottom}) * #{$accounts-number} - #{$account-margin-bottom}
    );
  }
  &-action {
    width: 100%;
    & + & {
      margin-left: 0;
    }
  }
  &-account {
    height: $account-height;
    &:not(:last-child) {
      margin-bottom: var(--s-basic-spacing);
    }
  }
  &-extension {
    &:not(:last-child) {
      margin-bottom: $basic-spacing-medium;
    }
  }
}
</style>
