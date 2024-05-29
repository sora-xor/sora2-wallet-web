<template>
  <connection-items v-if="accountList.length" :size="accountList.length">
    <wallet-account
      v-button
      v-for="{ account, isConnected } in accountList"
      :key="account.address"
      :polkadot-account="account"
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
import { Mixins, Component, Prop } from 'vue-property-decorator';

import WalletAccount from '../../Account/WalletAccount.vue';
import TranslationMixin from '../../mixins/TranslationMixin';

import ConnectionItems from './ConnectionItems.vue';

import type { AppWallet } from '../../../consts';
import type { PolkadotJsAccount } from '../../../types/common';

@Component({
  components: {
    ConnectionItems,
    WalletAccount,
  },
})
export default class AccountConnectionList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) private accounts!: Array<PolkadotJsAccount>;
  @Prop({ default: '', type: String }) private wallet!: AppWallet;
  @Prop({ default: () => false, type: Function }) private isConnected!: (account: PolkadotJsAccount) => boolean;

  get accountList() {
    return this.accounts.map((account) => {
      const source = this.wallet ?? ('' as AppWallet);
      const accountData = { ...account, source };

      return {
        account,
        isConnected: this.isConnected(accountData),
      };
    });
  }

  handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): void {
    this.$emit('select', account, isConnected);
  }
}
</script>
