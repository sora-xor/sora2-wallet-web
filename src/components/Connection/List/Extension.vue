<template>
  <div>
    <connection-items :size="wallets.length">
      <account-card
        v-button
        v-for="wallet in wallets"
        :key="wallet.extensionName"
        tabindex="0"
        @click.native="handleSelect(wallet)"
      >
        <template #avatar>
          <img v-if="wallet.logo.src" :src="wallet.logo.src" :alt="wallet.logo.alt" />
          <s-icon v-else name="finance-wallet-24" size="32" class="extension-icon--unknown" />
        </template>
        <template #name>
          <div class="extension-name">
            {{ wallet.title }}
            <div v-if="isRecommendedWallet(wallet)" class="extension-label extension-label--recommended">
              <span>{{ t('connection.wallet.recommended') }}</span>
              <s-icon name="basic-circle-star-24" size="12" />
            </div>
          </div>
        </template>
        <template #default>
          <a
            v-if="!wallet.installed && wallet.installUrl"
            :href="wallet.installUrl"
            target="_blank"
            rel="nofollow noopener noreferrer"
            class="connection-action"
          >
            <s-button size="mini" tabindex="-1">{{ t('connection.wallet.install') }}</s-button>
          </a>
          <span v-else-if="isSelectedWalletLoading(wallet)" class="connection-loading">
            <s-icon name="el-icon-loading" size="16" class="connection-loading-icon" />
          </span>

          <s-button v-if="hasDisconnectAction(wallet)" size="small" @click.native.stop="handleDisconnect(wallet)">
            {{ t('disconnectWalletText') }}
          </s-button>
          <s-button v-else-if="isConnectedWallet(wallet)" size="small" disabled>
            {{ t('connection.wallet.connected') }}
          </s-button>
        </template>
      </account-card>

      <slot />
    </connection-items>

    <p v-if="showDisclaimer" class="connection-disclaimer">
      {{ t('connection.disclaimer') }}
    </p>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import AccountCard from '../../Account/AccountCard.vue';
import TranslationMixin from '../../mixins/TranslationMixin';

import ConnectionItems from './ConnectionItems.vue';

import type { Wallet } from '../../../services/wallet/types';

@Component({
  components: {
    ConnectionItems,
    AccountCard,
  },
})
export default class ExtensionConnectionList extends Mixins(TranslationMixin) {
  @Prop({ default: () => [], type: Array }) readonly wallets!: Wallet[];
  @Prop({ default: () => [], type: Array }) readonly recommendedWallets!: string[];
  @Prop({ default: '', type: String }) readonly connectedWallet!: string;
  @Prop({ default: '', type: String }) readonly selectedWallet!: string;
  @Prop({ default: false, type: Boolean }) readonly selectedWalletLoading!: boolean;
  @Prop({ default: false, type: Boolean }) readonly showDisclaimer!: boolean;

  isSelectedWalletLoading(wallet: Wallet): boolean {
    return wallet.extensionName === this.selectedWallet && this.selectedWalletLoading;
  }

  isConnectedWallet(wallet: Wallet): boolean {
    return wallet.extensionName === this.connectedWallet;
  }

  isRecommendedWallet(wallet: Wallet): boolean {
    return this.recommendedWallets.includes(wallet.extensionName);
  }

  hasDisconnectAction(wallet: Wallet): boolean {
    if (!wallet.provider) return false;

    return wallet.provider.isConnected;
  }

  handleSelect(wallet: Wallet): void {
    if (!this.isSelectedWalletLoading(wallet)) {
      this.$emit('select', wallet);
    }
  }

  handleDisconnect(wallet: Wallet): void {
    this.$emit('disconnect', wallet);
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

.connection-disclaimer {
  margin-top: $basic-spacing-medium;
  text-align: center;
  font-size: var(--s-font-size-mini);
  color: var(--s-color-base-content-secondary);
}

.extension {
  &-icon {
    &--unknown {
      color: var(--s-color-base-content-secondary);
    }
  }

  &-name {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
  }

  &-label {
    display: flex;
    align-items: baseline;
    gap: $basic-spacing-tiny;
    border-radius: var(--s-border-radius-medium);
    padding: 2px 6px;
    font-size: var(--s-font-size-mini);
    text-transform: uppercase;

    i {
      color: inherit;
    }

    &--recommended {
      background-color: var(--s-color-theme-accent);
      color: var(--s-color-base-on-accent);
    }
  }
}
</style>
