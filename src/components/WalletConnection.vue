<template>
  <wallet-base :title="t('connection.title')">
    <div class="wallet-connection" v-loading="loading">
      <template v-if="!loading">
        <template v-if="isEntryView">
          <p class="wallet-connection-text">{{ t('connection.text') }}</p>
          <p v-if="!extensionsAvailability" class="wallet-connection-text" v-html="t('connection.install')" />
        </template>
        <template v-else>
          <p class="wallet-connection-text">
            {{ t(polkadotJsAccounts.length ? 'connection.selectAccount' : 'connection.noAccounts') }}
          </p>
        </template>

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
          <p
            v-if="!extensionsAvailability"
            class="wallet-connection-text no-permissions"
            v-html="t('connection.noPermissions')"
          />
        </template>

        <s-scrollbar v-else-if="isAccountListView" class="wallet-connection-accounts">
          <div
            class="wallet-connection-account"
            v-for="(account, index) in polkadotJsAccounts"
            :key="index"
            @click="handleSelectAccount(account)"
          >
            <wallet-account :polkadotAccount="account">
              <div v-if="isMultipleAvailableExtension && account.source" class="extension-label">
                <span v-if="hasIcon(account.source)" :class="['extension-label-icon', account.source]" />
                <span class="extension-label-name">{{ account.source }}</span>
              </div>
            </wallet-account>
          </div>
        </s-scrollbar>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';

import { state, action } from '../store/decorators';
import { Extensions } from '../consts';
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

  @state.router.currentRouteParams private currentRouteParams!: Record<string, Nullable<boolean>>;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.availableExtensions private availableExtensions!: Array<Extensions>;

  @action.account.importPolkadotJs private importPolkadotJs!: (address: string) => Promise<void>;

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.isAccountSwitch) {
        this.navigateToAccountList();
      }
    });
  }

  get extensionsAvailability(): boolean {
    return this.availableExtensions.length !== 0;
  }

  get isMultipleAvailableExtension(): boolean {
    return this.availableExtensions.length > 1;
  }

  get isAccountSwitch(): boolean {
    return !!this.currentRouteParams.isAccountSwitch;
  }

  get isEntryView(): boolean {
    return this.step === Step.First;
  }

  get isAccountListView(): boolean {
    return this.step === Step.Second;
  }

  get isUnableToSelectAccount(): boolean {
    return this.isAccountListView && !this.polkadotJsAccounts.length;
  }

  get actionButtonText(): string {
    if (this.isEntryView && !this.extensionsAvailability) {
      return 'connection.action.install';
    }
    if (this.isUnableToSelectAccount) {
      return 'connection.action.refresh';
    }
    return 'connection.action.connect';
  }

  handleActionClick(): void {
    if (this.isEntryView && !this.extensionsAvailability) {
      window.open('https://polkadot.js.org/extension/', '_blank');
      return;
    }
    if (this.isUnableToSelectAccount) {
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
        this.navigateToEntry();
      }
    });
  }

  private navigateToEntry(): void {
    this.step = Step.First;
  }

  private navigateToAccountList(): void {
    this.step = Step.Second;
  }

  handleLearnMoreClick(): void {
    this.$emit('learn-more');
  }

  hasIcon(extension: string): boolean {
    return Object.values(Extensions).includes(extension as Extensions);
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

$extensions: 'polkadot-js', 'subwallet-js';

.extension-label {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: var(--s-color-utility-surface);
  border-radius: calc(var(--s-border-radius-mini) / 2);
  box-shadow: var(--s-shadow-element-pressed);
  font-size: var(--s-font-size-mini);
  line-height: var(--s-line-height-medium);
  letter-spacing: var(--s-letter-spacing-small);
  padding: 2px 6px;

  &-icon {
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    margin-right: $basic-spacing-mini;

    @each $extension in $extensions {
      &.#{$extension} {
        background-image: url('~@/assets/img/extensions/#{$extension}.png');
      }
    }
  }
}
</style>
