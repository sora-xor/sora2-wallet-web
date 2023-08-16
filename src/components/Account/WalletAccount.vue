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
      <s-tooltip
        v-if="withIdentity && identity"
        border-radius="mini"
        :content="t('addressBook.identity')"
        placement="top"
        tabindex="-1"
      >
        <div class="account-on-chain-name">{{ identity }}</div>
      </s-tooltip>
      <slot />
    </template>
  </account-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import { ObjectInit } from '../../consts';
import { getter } from '../../store/decorators';
import { formatAddress, formatSoraAddress, getAccountIdentity } from '../../util';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import WalletAvatar from '../WalletAvatar.vue';

import AccountCard from './AccountCard.vue';

import type { PolkadotJsAccount } from '../../types/common';

const ADDRESS_LENGTH = 24;
const DEFAULT_NAME = '<unknown>';

@Component({
  components: {
    AccountCard,
    WalletAvatar,
  },
})
export default class WalletAccount extends Mixins(CopyAddressMixin, LoadingMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly polkadotAccount!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly withIdentity!: boolean;

  @getter.account.account private connected!: PolkadotJsAccount;

  accountIdentity = '';

  @Watch('address', { immediate: true })
  private async updateIdentity(value: string, oldValue: string) {
    if (!this.withIdentity || this.identity || value === oldValue) return;

    await this.withApi(async () => {
      this.accountIdentity = await getAccountIdentity(value);
      this.$emit('identity', this.accountIdentity);
    });
  }

  get account(): PolkadotJsAccount {
    return this.polkadotAccount || this.connected;
  }

  get address(): string {
    return formatSoraAddress(this.account.address);
  }

  get name(): string {
    return this.account.name || DEFAULT_NAME;
  }

  get identity(): string {
    return this.account.identity || this.accountIdentity;
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

.account-on-chain-name {
  max-width: 167px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  border-radius: calc(var(--s-border-radius-mini) / 2);
  padding: $inner-spacing-mini;
  background-color: var(--s-color-utility-surface);
  color: var(--s-color-base-content-secondary);
}
</style>
