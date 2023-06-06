<template>
  <account-card v-bind="$attrs">
    <template #avatar>
      <wallet-avatar slot="avatar" class="account-gravatar" :address="address" :size="28" />
    </template>
    <template #name>{{ name }}</template>
    <template #description>
      <!-- TODO: Add Copy address by Keyboard -->
      <s-tooltip :content="copyTooltip(t('account.walletAddress'))" tabindex="-1">
        <div class="account-credentials_address" @click="handleCopyAddress(address, $event)">
          <p class="first">{{ address }}</p>
          ...
          <p>{{ secondPartOfAddress }}</p>
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

import { ObjectInit } from '../../consts';
import { getter } from '../../store/decorators';
import { formatAddress, formatSoraAddress } from '../../util';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletAvatar from '../WalletAvatar.vue';

import AccountCard from './AccountCard.vue';

import type { PolkadotJsAccount } from '../../types/common';

const ADDRESS_LENGTH = 24;

@Component({
  components: {
    AccountCard,
    WalletAvatar,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin, CopyAddressMixin) {
  @getter.account.account private account!: PolkadotJsAccount;

  @Prop({ default: ObjectInit, type: Object }) readonly polkadotAccount!: PolkadotJsAccount;

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
    return formatAddress(this.address, ADDRESS_LENGTH);
  }

  get secondPartOfAddress(): string {
    // TODO: Remove this dirty hack. It's made just for browser search
    return this.address.slice(-ADDRESS_LENGTH / 2);
  }
}
</script>

<style lang="scss">
.account-gravatar {
  border: 2px solid var(--s-color-base-border-secondary);
  border-radius: 50%;

  & > circle:first-child {
    fill: var(--s-color-utility-surface);
  }
}
</style>

<style scoped lang="scss">
.account-credentials_address {
  display: flex;
  .first {
    width: 100px;
    white-space: nowrap;
    overflow: hidden;
  }
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
