<template>
  <connection-items :size="wallets.length">
    <account-card
      v-button
      v-for="wallet in wallets"
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
          v-if="!wallet.installed && wallet.installUrl"
          :href="wallet.installUrl"
          target="_blank"
          rel="nofollow noopener noreferrer"
          class="connection-action"
        >
          <s-button size="small" tabindex="-1">{{ t('connection.wallet.install') }}</s-button>
        </a>
        <s-button v-else-if="source === wallet.extensionName" size="small" disabled>
          {{ t('connection.wallet.connected') }}
        </s-button>
        <span class="connection-loading" v-else-if="selectedWallet === wallet.extensionName && selectedWalletLoading">
          <s-icon name="el-icon-loading" size="16" class="connection-loading-icon" />
        </span>
      </template>
    </account-card>

    <slot />
  </connection-items>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';
import type { Wallet } from '@sora-test/wallet-connect/types';

import AccountCard from '../Account/AccountCard.vue';
import ConnectionItems from './ConnectionItems.vue';
import TranslationMixin from '../mixins/TranslationMixin';

import { state } from '../../store/decorators';

@Component({
  components: {
    ConnectionItems,
    AccountCard,
  },
})
export default class ExtensionList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly wallets!: Wallet[];

  @state.account.source source!: string;
  @state.account.selectedWallet selectedWallet!: string;
  @state.account.selectedWalletLoading selectedWalletLoading!: boolean;

  handleSelect(wallet: Wallet): void {
    if (wallet.extensionName !== this.selectedWallet || !this.selectedWalletLoading) {
      this.$emit('select', wallet);
    }
  }
}
</script>

<style lang="scss" scoped>
.connection-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--s-size-small);
  height: var(--s-size-small);
}
</style>
