<template>
  <account-card class="address-book__contact" @click.native="handleSelectAddress(record.address, record.name)">
    <template #avatar>
      <wallet-avatar class="address-book__avatar" slot="avatar" :address="record.address" :size="28" />
    </template>
    <template #name>
      <span class="address-book__name">{{ record.name }}</span>
    </template>
    <template #description>
      <s-tooltip :content="copyTooltip(t('account.walletAddress'))" tabindex="-1">
        <div class="address-book__copy-address" @click="handleCopyAddress(record.address, $event)">
          <p>{{ formatBookAddress(record.address) }}</p>
        </div>
      </s-tooltip>
    </template>
    <s-tooltip border-radius="mini" :content="t('addressBook.identity')" placement="top" tabindex="-1">
      <div v-if="record.identity" class="address-book__on-chain-name">
        {{ record.identity }}
      </div>
    </s-tooltip>
    <slot />
  </account-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import AccountCard from '../Account/AccountCard.vue';
import WalletAvatar from '../WalletAvatar.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import { formatAddress } from '@/util';
import type { AccountBook } from '@/types/common';

@Component({
  components: {
    AccountCard,
    WalletAvatar,
  },
})
export default class Address extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ default: { name: '', address: '', identity: '' }, type: Object }) readonly record!: AccountBook;
  @Prop({ default: false, type: Boolean }) readonly showIdentity!: boolean;

  unlinkAddress(): void {
    this.$emit('unlink-address');
  }

  openAddressBook(): void {
    this.$emit('open-address-book');
  }

  handleSelectAddress(address: string, name: string): void {
    this.$emit('select-address', address, name);
  }

  formatBookAddress(address: string): string {
    return formatAddress(address, 24);
  }
}
</script>

<style lang="scss">
.address-book {
  &__contact {
    margin-bottom: $basic-spacing;
    &:hover {
      cursor: pointer;
    }
  }

  &__on-chain-name {
    max-width: 167px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    border-radius: calc(var(--s-border-radius-mini) / 2);
    padding: $inner-spacing-mini;
    background-color: var(--s-color-utility-surface);
    color: var(--s-color-base-content-secondary);
  }

  &__copy-address:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
