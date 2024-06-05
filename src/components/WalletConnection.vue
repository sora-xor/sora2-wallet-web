<template>
  <connection-view
    :login-account="loginAccount"
    :logout-account="logoutAccount"
    :create-account="createAccount"
    :close-view="navigateToAccount"
    :connected-wallet="connectedWallet"
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
  @state.account.isDesktop public isDesktop!: boolean;
  @state.account.source public connectedWallet!: string;

  @action.account.loginAccount public loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.logout public logoutAccount!: (forgetAddress?: string) => Promise<void>;

  @action.account.createAccount public createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;
  @action.account.renameAccount public renameAccount!: (data: { address: string; name: string }) => Promise<void>;
  @action.account.exportAccount public exportAccount!: (data: { address: string; password: string }) => Promise<void>;
  @action.account.deleteAccount public deleteAccount!: (address: string) => Promise<void>;

  @getter.account.isLoggedIn public isLoggedIn!: boolean;
  @getter.account.isConnectedAccount public isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

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
