<template>
  <connection-view
    :get-api="getApi"
    :account="account"
    :login-account="loginAccount"
    :logout-account="logoutAccount"
    :rename-account="renameAccount"
    :close-view="navigateToAccount"
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

  getApi() {
    return api;
  }

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
