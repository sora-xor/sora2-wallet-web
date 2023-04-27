<template>
  <account-card class="wallet-send-address-book-input" v-button>
    <template #avatar>
      <wallet-avatar slot="avatar" :address="record.address" :size="28" />
    </template>
    <template #name>
      <span>{{ record.name }}</span>
    </template>
    <template #description>
      <s-tooltip :content="copyTooltip(t('account.walletAddress'))" tabindex="-1">
        <div class="wallet-send-address-book-copy" @click="handleCopyAddress(record.address, $event)">
          <p class="first">{{ formatBookAddress(record.address) }}</p>
        </div>
      </s-tooltip>
    </template>
    <s-icon class="wallet-send-address-book-icon-unlink" name="el-icon-link" size="20" @click.native="unlinkAddress" />
    <s-icon class="wallet-send-address-book-icon-open" name="basic-user-24" size="18" @click.native="openAddressBook" />
  </account-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import AccountCard from '../Account/AccountCard.vue';
import WalletAvatar from '../WalletAvatar.vue';
import TranslationMixin from '../mixins/TranslationMixin';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import { formatAddress } from '@/util';

@Component({
  components: {
    AccountCard,
    WalletAvatar,
  },
})
export default class Address extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ default: { name: '', record: '' }, type: Object }) readonly record!: Record<string, string>;

  unlinkAddress(): void {
    this.$emit('unlink-address');
  }

  openAddressBook(): void {
    this.$emit('open-address-book');
  }

  formatBookAddress(address: string): string {
    return formatAddress(address, 24);
  }
}
</script>

<style lang="scss" scoped>
.wallet-send-address {
  &-book-icon-open {
    background: var(--s-color-base-content-tertiary);
    color: var(--s-color-base-background);
    padding: 2px;
    margin-left: 4px;
    border-radius: 4px;

    &:hover {
      cursor: pointer;
    }
  }
  &-book-icon-unlink {
    color: var(--s-color-base-content-secondary);
    margin-right: 6px;
    &:hover {
      cursor: pointer;
    }
  }
  &-book-copy:hover {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>
