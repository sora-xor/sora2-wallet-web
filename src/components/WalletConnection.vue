<template>
  <wallet-base :title="t('connection.title')">
    <div class="wallet-connection" v-loading="isAccountLoading || (isAccountSwitch && loading)">
      <template v-if="!isAccountLoading">
        <template v-if="step === Step.First">
          <p v-if="loading" class="wallet-connection-text">{{ t('connection.loadingTitle') }}</p>
          <template v-else>
            <p class="wallet-connection-text">{{ t('connection.text') }}</p>
            <p v-if="!isExtensionEnabled" class="wallet-connection-text" v-html="t('connection.install')" />
          </template>
        </template>
        <p v-if="step === Step.Second && !polkadotJsAccounts.length" class="wallet-connection-text">
          {{ t('connection.noAccounts') }}
        </p>
        <template v-if="step === Step.First || (step === Step.Second && !polkadotJsAccounts.length)">
          <s-button
            class="wallet-connection-action s-typography-button--large"
            type="primary"
            :loading="loading"
            @click="handleActionClick"
          >
            {{ t(actionButtonText) }}
          </s-button>
          <s-button
            v-if="!loading"
            class="wallet-connection-action s-typography-button--large"
            type="tertiary"
            icon="question-circle-16"
            icon-position="right"
            @click="handleLearnMoreClick"
          >
            {{ t('connection.action.learnMore') }}
          </s-button>
          <p
            v-if="(step === Step.First && !isExtensionEnabled) || loading"
            class="wallet-connection-text no-permissions"
            v-html="t('connection.noPermissions')"
          />
        </template>
        <template v-if="step === Step.Second && polkadotJsAccounts.length">
          <p class="wallet-connection-text">{{ t('connection.selectAccount') }}</p>
          <s-scrollbar class="wallet-connection-accounts">
            <div
              class="wallet-connection-account"
              v-for="account in polkadotJsAccounts"
              :key="account.address"
              @click="handleSelectAccount(account)"
            >
              <wallet-account :polkadotAccount="account" />
            </div>
          </s-scrollbar>
        </template>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import { RouteNames } from '../consts';
import type { PolkadotJsAccount } from '../types/common';

enum Step {
  First = 1,
  Second = 2,
}

// TODO: [PW-295] Refactor this component
@Component({
  components: { WalletBase, WalletAccount },
})
export default class WalletConnection extends Mixins(TranslationMixin, LoadingMixin) {
  readonly RouteNames = RouteNames;
  readonly Step = Step;

  isAccountLoading = true;
  isExtensionAvailable = false;
  extensionTimer: Nullable<NodeJS.Timer> = null;
  step = Step.First;

  @Getter currentRouteParams!: any;
  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action checkExtension!: () => Promise<boolean>;
  @Action getPolkadotJsAccounts!: AsyncVoidFn;
  @Action importPolkadotJs!: (address: string) => Promise<void>;

  get isAccountSwitch(): boolean {
    return (this.currentRouteParams || {}).isAccountSwitch;
  }

  get isExtensionEnabled(): boolean {
    if (this.isExtensionAvailable) {
      if (this.extensionTimer) {
        clearInterval(this.extensionTimer);
      }
      if (!this.polkadotJsAccounts.length) {
        this.step = Step.Second;
      }
      return true;
    }
    return false;
  }

  async created(): Promise<void> {
    await this.withLoading(async () => {
      this.isExtensionAvailable = await this.checkExtension();
      if (!this.isExtensionAvailable) {
        this.extensionTimer = setInterval(async () => {
          this.isExtensionAvailable = await this.checkExtension();
        }, 1500);
      }
    });
    if (this.isExtensionAvailable && (this.isAccountSwitch || !this.polkadotJsAccounts.length)) {
      this.step = Step.Second;
      await this.getPolkadotJsAccounts();
    }
    this.isAccountLoading = false;
  }

  get actionButtonText(): string {
    if (this.step === Step.First && !this.isExtensionEnabled) {
      return 'connection.action.install';
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      return 'connection.action.refresh';
    }
    return 'connection.action.connect';
  }

  async handleActionClick(): Promise<void> {
    if (this.step === Step.First) {
      if (!this.isExtensionEnabled) {
        window.open('https://polkadot.js.org/extension/', '_blank');
        return;
      }
      await this.withLoading(async () => {
        await this.getPolkadotJsAccounts();
        this.step = Step.Second;
      });
    } else if (!this.polkadotJsAccounts.length) {
      window.history.go();
    }
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    this.isAccountLoading = true;
    try {
      await this.importPolkadotJs(account.address);
    } catch (error) {
      this.$alert(this.t((error as Error).message), this.t('errorText'));
      this.step = Step.First;
    } finally {
      this.isAccountLoading = false;
    }
    this.navigate({ name: RouteNames.Wallet });
  }

  beforeDestroy(): void {
    if (this.extensionTimer) {
      clearInterval(this.extensionTimer);
    }
  }

  handleLearnMoreClick(): void {
    this.$emit('learn-more');
  }
}
</script>

<style lang="scss">
.wallet-connection-link {
  color: var(--s-color-theme-accent);
  text-decoration: none;
}
.wallet-connection-accounts {
  @include scrollbar(18px);
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
  &-text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
    margin-bottom: #{$basic-spacing-medium};
    &.no-permissions {
      margin-top: var(--s-basic-spacing);
    }
  }
  &-accounts {
    height: calc(
      calc(#{$account-height} + #{$account-margin-bottom}) * #{$accounts-number} - #{$account-margin-bottom}
    );
  }
  &-account {
    height: $account-height;
    &:not(:last-child) {
      margin-bottom: var(--s-basic-spacing);
    }
    &:hover {
      cursor: pointer;
      .wallet-account {
        border-color: var(--s-color-base-content-secondary);
      }
    }
  }
  &-action {
    width: 100%;
    & + & {
      margin-left: 0;
      margin-top: #{$basic-spacing-medium};
    }
    &.s-secondary {
      margin-left: 0;
    }
  }
}
</style>
