<template>
  <connection-items>
    <account-card
      v-button
      v-for="wallet in availableWallets"
      :key="wallet.extensionName"
      tabindex="0"
      @click.native="handleSelect(wallet)"
    >
      <template #avatar>
        <img :src="wallet.logo.src" :alt="wallet.logo.alt" />
      </template>
      <template #name>{{ wallet.title }}</template>
      <template #default>
        <a
          v-if="!wallet.installed"
          :href="getWalletInstallUrl(wallet)"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          <s-button size="small" tabindex="-1">{{ t('connection.wallet.install') }}</s-button>
        </a>
        <s-button v-if="source === wallet.extensionName" size="small" disabled>
          {{ t('connection.wallet.connected') }}
        </s-button>
      </template>
    </account-card>

    <slot />
  </connection-items>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import AccountCard from '@/components/AccountCard.vue';
import ConnectionItems from '@/components/Connection/ConnectionItems.vue';
import TranslationMixin from '@/components/mixins/TranslationMixin';

import { state } from '@/store/decorators';
import { getWalletInstallUrl } from '@/util';

import type { Wallet } from '@subwallet/wallet-connect/types';

@Component({
  components: {
    ConnectionItems,
    AccountCard,
  },
})
export default class ExtensionList extends Mixins(TranslationMixin) {
  @state.account.availableWallets availableWallets!: Array<Wallet>;
  @state.account.source source!: string;

  readonly getWalletInstallUrl = getWalletInstallUrl;

  handleSelect(wallet: Wallet): void {
    this.$emit('select', wallet);
  }
}
</script>
