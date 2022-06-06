<template>
  <s-card v-bind="{ shadow: 'always', size: 'small', borderRadius: 'medium', ...$attrs }" class="wallet-account">
    <div class="account s-flex">
      <wallet-avatar class="account-avatar" :address="address" :size="28" />
      <div class="account-details s-flex">
        <div class="account-credentials s-flex">
          <div v-if="name" class="account-credentials_name">{{ name }}</div>
          <s-tooltip :content="copyTooltip" :open-delay="200">
            <div class="account-credentials_address" @click="handleCopyAddress(address)">{{ formattedAddress }}</div>
          </s-tooltip>
        </div>
        <slot />
      </div>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import WalletAvatar from './WalletAvatar.vue';

import TranslationMixin from './mixins/TranslationMixin';
import CopyAddressMixin from './mixins/CopyAddressMixin';
import { formatAddress, formatSoraAddress } from '../util';
import { getter } from '../store/decorators';
import type { Account, PolkadotJsAccount } from '../types/common';

@Component({
  components: {
    WalletAvatar,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin, CopyAddressMixin) {
  @getter.account.account private account!: Account;

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
.account-avatar {
  border: 2px solid var(--s-color-base-border-secondary);
  border-radius: 50%;
  svg circle:first-child {
    fill: var(--s-color-utility-surface);
  }
}

.account-menu i:hover {
  color: var(--s-color-theme-accent);
}

.account {
  &-details {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>

<style scoped lang="scss">
$avatar-margin-right: #{$basic-spacing-small};
$avatar-size: 32px;

.wallet-account.s-card {
  border: 1px solid transparent;
}

.account {
  align-items: center;

  &-avatar {
    margin-right: $avatar-margin-right;
    width: $avatar-size;
    height: $avatar-size;
    flex-shrink: 0;
  }
  &-details {
    flex: 1;
    align-items: center;
    width: calc(100% - #{$avatar-size} - #{$avatar-margin-right});
  }
  &-credentials {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    &_name,
    &_address {
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: var(--s-letter-spacing-small);
    }
    &_name {
      font-size: var(--s-font-size-medium);
      font-weight: 600;
      line-height: var(--s-line-height-medium);
      outline: none;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &_address {
      @include value-prefix(width, fit-content);
      @include hint-text;
      outline: none;
      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>
