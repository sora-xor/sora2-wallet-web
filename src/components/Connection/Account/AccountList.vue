<template>
  <connection-items :size="polkadotJsAccounts.length">
    <wallet-account
      v-button
      v-for="(account, index) in polkadotJsAccounts"
      :key="index"
      :polkadotAccount="account"
      tabindex="0"
      @click.native="handleSelectAccount(account)"
    >
      <s-button v-if="isConnectedAccount(account)" size="small" disabled>
        {{ t('connection.wallet.connected') }}
      </s-button>
    </wallet-account>

    <slot />
  </connection-items>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import WalletAccount from '@/components/Account/WalletAccount.vue';
import ConnectionItems from '@/components/Connection/ConnectionItems.vue';
import TranslationMixin from '@/components/mixins/TranslationMixin';

import { state, getter } from '@/store/decorators';

import type { PolkadotJsAccount } from '@/types/common';

@Component({
  components: {
    ConnectionItems,
    WalletAccount,
  },
})
export default class AccountList extends Mixins(TranslationMixin) {
  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @getter.account.isConnectedAccount isConnectedAccount!: (account: PolkadotJsAccount) => boolean;

  handleSelectAccount(account: PolkadotJsAccount): void {
    this.$emit('select', account);
  }
}
</script>
