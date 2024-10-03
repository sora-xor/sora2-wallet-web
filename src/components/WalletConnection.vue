<template>
  <connection-view
    :chain-api="chainApi"
    :account="account"
    :login-account="loginAccount"
    :logout-account="logoutAccount"
    :rename-account="renameAccount"
    :check-connected-account-source="checkConnectedAccountSource"
    :close-view="navigateToAccount"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { api } from '../api';
import { RouteNames } from '../consts';
import { action, getter, mutation } from '../store/decorators';

import ConnectionView from './Connection/ConnectionView.vue';
import TranslationMixin from './mixins/TranslationMixin';

import type { Route } from '../store/router/types';
import type { PolkadotJsAccount } from '../types/common';

@Component({
  components: { ConnectionView },
})
export default class WalletConnection extends Mixins(TranslationMixin) {
  @getter.account.account public account!: Nullable<PolkadotJsAccount>;

  @action.account.loginAccount public loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.logout public logoutAccount!: (forgetAddress?: string) => Promise<void>;
  @action.account.renameAccount public renameAccount!: (data: { address: string; name: string }) => Promise<void>;
  @action.account.checkConnectedAccountSource public checkConnectedAccountSource!: (source: string) => Promise<void>;

  get chainApi() {
    return api;
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
