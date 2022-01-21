<template>
  <wallet-base
    :title="t('wallet.title')"
    :show-action="permissions.createAssets"
    :show-clean-history="currentTab === WalletTabs.Activity"
    :disabled-clean-history="isCleanHistoryDisabled"
    action-icon="various-atom-24"
    action-tooltip="wallet.createToken"
    @action="handleCreateToken"
    @cleanHistory="handleCleanHistory"
  >
    <wallet-account show-controls />
    <div class="wallet">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab v-for="tab in WalletTabs" :key="tab" :label="t(`wallet.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @swap="handleSwap" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import type { AccountHistory, HistoryItem } from '@sora-substrate/util';

import { api } from '../api';
import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import WalletAccount from './WalletAccount.vue';
import WalletAssets from './WalletAssets.vue';
import WalletActivity from './WalletActivity.vue';
import { RouteNames, WalletTabs } from '../consts';
import type { Account } from '../types/common';
import type { WalletPermissions } from '../consts';

@Component({
  components: {
    WalletBase,
    WalletAccount,
    WalletAssets,
    WalletActivity,
  },
})
export default class Wallet extends Mixins(TranslationMixin) {
  readonly WalletTabs = WalletTabs;

  @Getter currentRouteParams!: any;
  @Getter account!: Account;
  @Getter activity!: AccountHistory<HistoryItem>;
  @Getter permissions!: WalletPermissions;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;
  @Action getAccountActivity!: AsyncVoidFn;

  currentTab: WalletTabs = WalletTabs.Assets;

  mounted() {
    if (this.currentRouteParams.currentTab) this.currentTab = this.currentRouteParams.currentTab;
  }

  get isCleanHistoryDisabled(): boolean {
    return !Object.keys(this.activity).length;
  }

  handleChangeTab(value: WalletTabs): void {
    this.currentTab = value;
  }

  handleSwap(asset: any): void {
    this.$emit('swap', asset);
  }

  handleCreateToken(): void {
    this.navigate({ name: RouteNames.CreateToken });
  }

  handleCleanHistory(): void {
    api.clearHistory();
    this.getAccountActivity();
  }
}
</script>

<style lang="scss">
.wallet {
  @include custom-tabs;
}
</style>

<style scoped lang="scss">
.wallet {
  margin-top: #{$basic-spacing-medium};
}
</style>
