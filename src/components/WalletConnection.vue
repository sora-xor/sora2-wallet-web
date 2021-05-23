<template>
  <wallet-base :title="t('connection.title')">
    <div class="wallet-connection" v-loading="isAccountLoading">
      <template v-if="step === Step.First">
        <p v-if="loading" class="wallet-connection-text p4">{{ t('connection.loadingTitle') }}</p>
        <template v-else>
          <p class="wallet-connection-text p4">{{ t('connection.text') }}</p>
          <p v-if="!isExtensionAvailable" class="wallet-connection-text p4" v-html="t('connection.install')" />
        </template>
      </template>
      <p v-if="step === Step.Second && !polkadotJsAccounts.length" class="wallet-connection-text p4">{{ t('connection.noAccounts') }}</p>
      <template v-if="step === Step.First || (step === Step.Second && !polkadotJsAccounts.length)">
        <s-button
          class="wallet-connection-action"
          type="primary"
          :loading="loading"
          @click="handleActionClick"
        >
          {{ t(actionButtonText) }}
        </s-button>
        <s-button
          v-if="!loading"
          class="wallet-connection-action"
          icon="question-circle-16"
          icon-position="right"
          @click="handleLearnMoreClick"
        >
          {{ t('connection.action.learnMore') }}
        </s-button>
        <p v-if="(step === Step.First && !isExtensionAvailable) || loading" class="wallet-connection-text no-permissions p4" v-html="t('connection.noPermissions')" />
      </template>
      <template v-if="step === Step.Second && polkadotJsAccounts.length">
        <p class="wallet-connection-text p4">{{ t('connection.selectAccount') }}</p>
        <div
          class="wallet-connection-account"
          v-for="account in polkadotJsAccounts"
          :key="account.address"
          @click="handleSelectAccount(account)"
        >
          <wallet-account :polkadotAccount="account" />
        </div>
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

  isAccountLoading = false
  isExtensionAvailable = false
  step = Step.First
  polkadotJsAccounts: Array<Account> = []
  @Getter currentRouteParams!: any

  @Action navigate
  @Action checkExtension
  @Action getPolkadotJsAccounts
  @Action importPolkadotJs

  async created (): Promise<void> {
    await this.withLoading(async () => {
      this.isExtensionAvailable = await this.checkExtension()
    })
    if ((this.currentRouteParams || {}).isAccountSwitch) {
      this.step = Step.Second
      this.polkadotJsAccounts = await this.getPolkadotJsAccounts()
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
        window.open('https://polkadot.js.org/extension/', '_blank')
        return
      }
      this.step = Step.Second
      this.polkadotJsAccounts = await this.getPolkadotJsAccounts()
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
.wallet-connection {
  &-text {
    color: var(--s-color-base-content-tertiary);
    margin-bottom: $basic-spacing_mini;
    &.no-permissions {
      margin-top: $basic-spacing_mini;
    }
  }
  &-account {
    margin-bottom: $basic-spacing_mini;
    &:hover {
      cursor: pointer;
      .wallet-account {
        border-color: var(--s-color-base-content-quaternary);
      }
    }
  }
  &-action {
    margin-top: $basic-spacing_mini;
    width: 100%;
    &.s-secondary {
      margin-left: 0;
    }
  }
}
</style>
