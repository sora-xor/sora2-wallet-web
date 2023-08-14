<template>
  <wallet-account :polkadot-account="record" class="address-book__contact">
    <s-tooltip border-radius="mini" :content="t('addressBook.identity')" placement="top" tabindex="-1">
      <div v-if="record.identity" class="address-book__on-chain-name">
        {{ record.identity }}
      </div>
    </s-tooltip>
    <slot />
  </wallet-account>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import WalletAccount from '../Account/WalletAccount.vue';
import CopyAddressMixin from '../mixins/CopyAddressMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletAvatar from '../WalletAvatar.vue';

import type { AccountBook } from '../../types/common';

@Component({
  components: {
    WalletAccount,
    WalletAvatar,
  },
})
export default class Address extends Mixins(TranslationMixin, CopyAddressMixin) {
  @Prop({ default: { name: '', address: '', identity: '' }, type: Object }) readonly record!: AccountBook;
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
}
</style>
