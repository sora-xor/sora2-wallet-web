<template>
  <connection-view
    :accounts="polkadotJsAccounts"
    :login-account="loginAccount"
    :create-account="createAccount"
    :restore-account="restoreAccount"
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

import { action, getter, state } from '../store/decorators';

import ConnectionView from './Connection/ConnectionView.vue';
import TranslationMixin from './mixins/TranslationMixin';

import type { AppWallet } from '../consts';
import type { CreateAccountArgs, RestoreAccountArgs } from '../store/account/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../types/common';

@Component({
  components: { ConnectionView },
})
export default class WalletConnection extends Mixins(TranslationMixin) {
  @state.account.isDesktop isDesktop!: boolean;
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.selectedWallet public selectedWallet!: AppWallet;

  @action.account.loginAccount public loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.logout public logout!: (forgetAddress?: string) => Promise<void>;

  @action.account.createAccount public createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;
  @action.account.renameAccount public renameAccount!: (data: { address: string; name: string }) => Promise<void>;
  @action.account.exportAccount public exportAccount!: (data: { address: string; password: string }) => Promise<void>;
  @action.account.deleteAccount public deleteAccount!: (address: string) => Promise<void>;
  @action.account.restoreAccountFromJson public restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

  @getter.account.isConnectedAccount public isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  handleLearnMore(): void {
    this.$emit('learn-more');
  }
}
</script>

<style lang="scss" scoped>
.learn-more-btn {
  width: 100%;
}
</style>
