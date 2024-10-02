<template>
  <div class="wallet-connection">
    <p class="wallet-connection-text">{{ t('connection.text') }}</p>

    <div v-if="internalWallets.length" class="wallet-connection-list">
      <p class="wallet-connection-title">{{ t('connection.list.integrated') }}</p>
      <extension-connection-list
        :wallets="internalWallets"
        :recommended-wallets="recommendedWallets"
        :connected-wallet="connectedWallet"
        :selected-wallet="selectedWallet"
        :selected-wallet-loading="selectedWalletLoading"
        @select="handleSelectWallet"
        @disconnect="handleDisconnectWallet"
      />
    </div>
    <div v-if="externalWallets.length" class="wallet-connection-list">
      <p class="wallet-connection-title">{{ t('connection.list.extensions') }}</p>
      <extension-connection-list
        :wallets="externalWallets"
        :recommended-wallets="recommendedWallets"
        :connected-wallet="connectedWallet"
        :selected-wallet="selectedWallet"
        :selected-wallet-loading="selectedWalletLoading"
        @select="handleSelectWallet"
        @disconnect="handleDisconnectWallet"
      />
    </div>

    <slot />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import { AppWallet } from '../../../consts';
import TranslationMixin from '../../mixins/TranslationMixin';
import ExtensionConnectionList from '../List/Extension.vue';

import type { Wallet } from '@sora-test/wallet-connect/types';

@Component({
  components: {
    ExtensionConnectionList,
  },
})
export default class ExtensionListStep extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly connectedWallet!: string;
  @Prop({ default: '', type: String }) readonly selectedWallet!: AppWallet;
  @Prop({ default: false, type: Boolean }) readonly selectedWalletLoading!: boolean;
  @Prop({ default: () => [], type: Array }) readonly internalWallets!: Wallet[];
  @Prop({ default: () => [], type: Array }) readonly externalWallets!: Wallet[];
  @Prop({ default: () => [], type: Array }) readonly recommendedWallets!: string[];

  handleSelectWallet(wallet: Wallet): void {
    this.$emit('select', wallet);
  }

  handleDisconnectWallet(wallet: Wallet): void {
    this.$emit('disconnect', wallet);
  }
}
</script>

<style scoped lang="scss">
.wallet-connection {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-big;
  min-height: 102px;

  &-text {
    color: var(--s-color-base-content-primary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
  }

  &-title {
    color: var(--s-color-base-content-secondary);
    font-size: var(--s-font-size-extra-small);
    font-weight: 600;
    line-height: var(--s-line-height-small);
    text-transform: uppercase;
  }

  &-list {
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing-small;
  }
}
</style>
