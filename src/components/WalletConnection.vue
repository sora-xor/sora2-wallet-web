<template>
  <connection-view
    :accounts="polkadotJsAccounts"
    :login-account="loginAccount"
    :logout-account="logoutAccount"
    :create-account="createAccount"
    :restore-account="restoreAccount"
    :close-view="navigateToAccount"
    :connected-wallet="connectedWallet"
    :selected-wallet="selectedWallet"
    :selected-wallet-title="selectedWalletTitle"
    :selected-wallet-loading="selectedWalletLoading"
    :select-wallet="selectWallet"
    :reset-selected-wallet="resetSelectedWallet"
    :is-logged-in="isLoggedIn"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #extension>
      <s-button
        class="s-typography-button--large learn-more-btn"
        type="tertiary"
        icon="question-circle-16"
        icon-position="right"
        @click="handleLearnMore"
      >
        {{ t('connection.action.learnMore') }}
      </s-button>
    </template>
  </connection-view>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { RouteNames } from '../consts';
import { action, getter, mutation, state } from '../store/decorators';

import ConnectionView from './Connection/ConnectionView.vue';
import TranslationMixin from './mixins/TranslationMixin';

import type { AppWallet } from '../consts';
import type { CreateAccountArgs, RestoreAccountArgs } from '../store/account/types';
import type { Route } from '../store/router/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../types/common';

@Component({
  components: { ConnectionView },
})
export default class WalletConnection extends Mixins(TranslationMixin) {
  @state.account.isDesktop isDesktop!: boolean;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.source public connectedWallet!: string;
  @state.account.selectedWallet public selectedWallet!: AppWallet;
  @state.account.selectedWalletLoading public selectedWalletLoading!: boolean;

  @action.account.loginAccount public loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.logout public logoutAccount!: (forgetAddress?: string) => Promise<void>;

  @action.account.createAccount public createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;
  @action.account.renameAccount public renameAccount!: (data: { address: string; name: string }) => Promise<void>;
  @action.account.exportAccount public exportAccount!: (data: { address: string; password: string }) => Promise<void>;
  @action.account.deleteAccount public deleteAccount!: (address: string) => Promise<void>;
  @action.account.restoreAccountFromJson public restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

  @action.account.selectWallet public selectWallet!: (wallet: AppWallet) => Promise<void>;
  @action.account.resetSelectedWallet public resetSelectedWallet!: FnWithoutArgs;

  @getter.account.isLoggedIn public isLoggedIn!: boolean;
  @getter.account.isConnectedAccount public isConnectedAccount!: (account: PolkadotJsAccount) => boolean;
  @getter.account.selectedWalletTitle public selectedWalletTitle!: string;

  handleLearnMore(): void {
    this.$emit('learn-more');
  }

  @mutation.router.navigate private navigate!: (options: Route) => void;

  navigateToAccount(): void {
    this.navigate({ name: RouteNames.Wallet });
  }
}
</script>

<style lang="scss" scoped>
.learn-more-btn {
  width: 100%;
}
</style>
