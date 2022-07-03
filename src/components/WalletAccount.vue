<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>{{ name }}</template>
    <template #description>
      <s-tooltip :content="copyTooltip(t('account.walletAddress'))">
        <div class="account-credentials_address" @click="handleCopyAddress(address, $event)">
          {{ formattedAddress }}
        </div>
      </s-tooltip>
    </template>
    <template #default>
      <slot />
    </template>
  </account-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import WalletAvatar from './WalletAvatar.vue';
import AccountCard from './AccountCard.vue';

import TranslationMixin from './mixins/TranslationMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import { formatAddress, formatSoraAddress } from '../util';
import { getter } from '../store/decorators';
import type { PolkadotJsAccount } from '../types/common';

@Component({
  components: {
    AccountCard,
    WalletAvatar,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin, CopyAddressMixin) {
  @getter.account.account private account!: PolkadotJsAccount;

  @Prop({ default: () => null, type: Object }) readonly polkadotAccount!: PolkadotJsAccount;

  get address(): string {
    if (this.polkadotAccount) {
      return formatSoraAddress(this.polkadotAccount.address);
    }
    return this.account.address;
  }

  get name(): string {
    return (this.polkadotAccount || this.account).name;
  }

  get formattedAddress(): string {
    return formatAddress(this.address, 24);
  }
}
</script>

<style lang="scss">
.account-gravatar {
  border: 2px solid var(--s-color-base-border-secondary);
  border-radius: 50%;
  svg circle:first-child {
    fill: var(--s-color-utility-surface);
  }
}
</style>
