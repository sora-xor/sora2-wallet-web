<template>
  <component
    :is="component"
    :accounts="polkadotJsAccounts"
    :login-account="loginAccount"
    :create-account="createAccount"
    :restore-account="restoreAccount"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { action, getter, state } from '../store/decorators';

import InternalConnection from './Connection/Views/InternalConnection.vue';
import WebConnection from './Connection/Views/WebConnection.vue';

import type { AppWallet } from '../consts';
import type { CreateAccountArgs, RestoreAccountArgs } from '../store/account/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../types/common';

@Component({
  components: { WebConnection, InternalConnection },
})
export default class WalletConnection extends Vue {
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

  get component(): string {
    return this.isDesktop ? 'InternalConnection' : 'WebConnection';
  }
}
</script>
