<template>
  <connection-items v-if="accountList.length" :size="accountList.length">
    <wallet-account
      v-button
      v-for="{ account, isConnected } in accountList"
      :key="account.address"
      :polkadotAccount="account"
      tabindex="0"
      @click.native="handleSelectAccount(account, isConnected)"
    >
      <s-button v-if="isConnected" size="small" disabled>
        {{ t('connection.wallet.connected') }}
      </s-button>

      <slot name="menu" v-bind="account" />
    </wallet-account>

    <slot />
  </connection-items>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import { state, getter } from '../../store/decorators';
import WalletAccount from '../Account/WalletAccount.vue';
import TranslationMixin from '../mixins/TranslationMixin';

import ConnectionItems from './ConnectionItems.vue';

import type { AppWallet } from '../../consts';
import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    ConnectionItems,
    WalletAccount,
  },
})
export default class AccountList extends Mixins(TranslationMixin) {
  @state.account.polkadotJsAccounts private polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.selectedWallet private selectedWallet!: AppWallet;
  @getter.account.isConnectedAccount private isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  get accountList() {
    return this.polkadotJsAccounts.map((account) => {
      const source = this.selectedWallet ?? ('' as AppWallet);
      const accountData = { ...account, source };

      return {
        account,
        isConnected: this.isConnectedAccount(accountData),
      };
    });
  }

  handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): void {
    this.$emit('select', account, isConnected);
  }
}
</script>
