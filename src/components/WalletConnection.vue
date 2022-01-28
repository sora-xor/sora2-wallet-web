<template>
  <wallet-base :title="t('connection.title')">
    <div class="wallet-connection" v-loading="loading">
      <template v-if="!loading">
        <template v-if="step === Step.First">
          <p class="wallet-connection-text">{{ t('connection.text') }}</p>
          <p v-if="!extensionAvailability" class="wallet-connection-text" v-html="t('connection.install')" />
        </template>
        <template v-else>
          <p class="wallet-connection-text">
            {{ t(polkadotJsAccounts.length ? 'connection.selectAccount' : 'connection.noAccounts') }}
          </p>
        </template>

        <template v-if="step === Step.First || (step === Step.Second && !polkadotJsAccounts.length)">
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
          <p
            v-if="!extensionAvailability"
            class="wallet-connection-text no-permissions"
            v-html="t('connection.noPermissions')"
          />
        </template>

        <s-scrollbar v-else-if="step === Step.Second" class="wallet-connection-accounts">
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

import type { PolkadotJsAccount } from '../types/common';

enum Step {
  First = 1,
  Second = 2,
}

@Component({
  components: { WalletBase, WalletAccount },
})
export default class WalletConnection extends Mixins(TranslationMixin, LoadingMixin) {
  readonly Step = Step;

  step = Step.First;

  @Getter currentRouteParams!: any;
  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @Getter extensionAvailability!: boolean;

  @Action importPolkadotJs!: (address: string) => Promise<void>;

  get isAccountSwitch(): boolean {
    return (this.currentRouteParams || {}).isAccountSwitch;
  }

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.isAccountSwitch) {
        this.navigateToAccountList();
      }
    });
  }

  get actionButtonText(): string {
    if (this.step === Step.First && !this.extensionAvailability) {
      return 'connection.action.install';
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      return 'connection.action.refresh';
    }
    return 'connection.action.connect';
  }

  handleActionClick(): void {
    if (this.step === Step.First && !this.extensionAvailability) {
      window.open('https://polkadot.js.org/extension/', '_blank');
      return;
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      window.history.go();
      return;
    }

    this.navigateToAccountList();
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account.address);
      } catch (error) {
        this.$alert(this.t((error as Error).message), this.t('errorText'));
        this.step = Step.First;
      }
    });
  }

  private navigateToAccountList(): void {
    this.step = Step.Second;
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
  @include scrollbar($basic-spacing-big);
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
    }
  }
}
</style>
