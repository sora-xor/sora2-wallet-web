<template>
  <wallet-base :title="t('connection.title')">
    <div class="wallet-connection" v-loading="isAccountLoading || (isAccountSwitch && loading)">
      <template v-if="!isAccountLoading">
        <template v-if="step === Step.First">
          <p v-if="loading" class="wallet-connection-text">{{ t('connection.loadingTitle') }}</p>
          <template v-else>
            <p class="wallet-connection-text">{{ t('connection.text') }}</p>
            <p v-if="!(isExtensionInstalled && isExtensionAvailable)" class="wallet-connection-text" v-html="t('connection.install')" />
          </template>
        </template>
        <p v-if="step === Step.Second && !polkadotJsAccounts.length" class="wallet-connection-text">{{ t('connection.noAccounts') }}</p>
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
          <p v-if="(step === Step.First && !(isExtensionInstalled && isExtensionAvailable)) || loading" class="wallet-connection-text no-permissions" v-html="t('connection.noPermissions')" />
        </template>
        <template v-if="step === Step.Second && polkadotJsAccounts.length">
          <p class="wallet-connection-text">{{ t('connection.selectAccount') }}</p>
          <div class="wallet-connection-accounts">
            <div
              class="wallet-connection-account"
              v-for="account in polkadotJsAccounts"
              :key="account.address"
              @click="handleSelectAccount(account)"
            >
              <wallet-account :polkadotAccount="account" />
            </div>
          </div>
        </template>
      </template>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import LoadingMixin from './mixins/LoadingMixin'
import WalletBase from './WalletBase.vue'
import WalletAccount from './WalletAccount.vue'
import { RouteNames } from '../consts'

enum Step {
  First = 1,
  Second = 2
}

interface Account {
  address: string;
  name: string;
}

@Component({
  components: { WalletBase, WalletAccount }
})
export default class WalletConnection extends Mixins(TranslationMixin, LoadingMixin) {
  readonly RouteNames = RouteNames
  readonly Step = Step

  isAccountLoading = true
  isExtensionAvailable = false
  extensionTimer: any
  setExtensionTimer = false
  step = Step.First
  polkadotJsAccounts: Array<Account> = []
  @Getter currentRouteParams!: any

  @Action navigate
  @Action checkExtension
  @Action getPolkadotJsAccounts
  @Action importPolkadotJs

  get isAccountSwitch (): boolean {
    return (this.currentRouteParams || {}).isAccountSwitch
  }

  get isExtensionInstalled (): boolean {
    if (this.isExtensionAvailable) {
      if (this.extensionTimer) {
        this.setExtensionTimer = false
        clearInterval(this.extensionTimer)
      }
      return true
    }
    if (this.setExtensionTimer) {
      this.extensionTimer = setInterval(async () => {
        this.isExtensionAvailable = await this.checkExtension()
      }, 3000)
    }
    return this.isExtensionAvailable
  }

  async created (): Promise<void> {
    await this.withLoading(async () => {
      this.isExtensionAvailable = await this.checkExtension()
      if (this.isAccountSwitch) {
        this.step = Step.Second
        this.polkadotJsAccounts = await this.getPolkadotJsAccounts()
      }
    })
    this.isAccountLoading = false
  }

  destroyed (): void {
    if (this.extensionTimer) {
      clearInterval(this.extensionTimer)
    }
  }

  get actionButtonText (): string {
    if (this.step === Step.First && !this.isExtensionAvailable) {
      return 'connection.action.install'
    }
    if (this.step === Step.Second && !this.polkadotJsAccounts.length) {
      return 'connection.action.refresh'
    }
    return 'connection.action.connect'
  }

  async handleActionClick (): Promise<void> {
    if (this.step === Step.First) {
      if (!this.isExtensionAvailable) {
        this.setExtensionTimer = true
        window.open('https://polkadot.js.org/extension/', '_blank')
        return
      }
      await this.withLoading(async () => {
        this.polkadotJsAccounts = await this.getPolkadotJsAccounts()
        this.step = Step.Second
      })
    } else if (!this.polkadotJsAccounts.length) {
      window.history.go()
    }
  }

  async handleSelectAccount (account: Account): Promise<void> {
    this.isAccountLoading = true
    try {
      await this.importPolkadotJs({ address: account.address })
    } catch (error) {
      this.$alert(this.t((error as Error).message), this.t('errorText'))
      this.step = Step.First
    } finally {
      this.isAccountLoading = false
    }
    this.navigate({ name: RouteNames.Wallet })
  }

  handleLearnMoreClick (): void {
    this.$emit('learn-more')
  }
}
</script>

<style lang="scss">
.wallet-connection-link {
  color: var(--s-color-theme-accent);
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
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
    margin-bottom: calc(var(--s-basic-spacing) * 2);
    &.no-permissions {
      margin-top: var(--s-basic-spacing);
    }
  }
  &-accounts {
    margin: calc(-1 * #{$accounts-padding});
    max-height: calc(calc(#{$account-height} + #{$account-margin-bottom}) * #{$accounts-number});
    padding: $accounts-padding;
    overflow-y: auto;
  }
  &-account {
    margin-bottom: var(--s-basic-spacing);
    height: $account-height;
    &:hover {
      cursor: pointer;
      .wallet-account {
        border-color: var(--s-color-base-content-quaternary);
      }
    }
  }
  &-action {
    width: 100%;
    & + & {
      margin-left: 0;
      margin-top: calc(var(--s-basic-spacing) * 2);
    }
    &.s-secondary {
      margin-left: 0;
    }
  }
}
</style>
