<template>
  <s-card shadow="always" size="small" border-radius="medium" class="wallet-account">
    <div class="account s-flex">
      <wallet-avatar class="account-avatar" :address="address" :size="28" />
      <div class="account-details s-flex">
        <div class="account-credentials s-flex">
          <div v-if="name" class="account-credentials_name">{{ name }}</div>
          <s-tooltip :content="t('account.copy')">
            <div class="account-credentials_address" @click="handleCopyAddress($event)">{{ formattedAddress }}</div>
          </s-tooltip>
        </div>
        <template v-if="showControls">
          <s-button
            class="account__action-button account-switch"
            type="action"
            alternative
            rounded
            :tooltip="t('account.switch')"
            @click="handleSwitchAccount"
          >
            <s-icon name="arrows-refresh-ccw-24" size="28" />
          </s-button>
        </template>
      </div>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { Getter, Action } from 'vuex-class';

import TranslationMixin from './mixins/TranslationMixin';
import { RouteNames } from '../consts';
import { copyToClipboard, formatAddress, formatSoraAddress } from '../util';
import WalletAvatar from './WalletAvatar.vue';
import type { Account, PolkadotJsAccount } from '../types/common';

@Component({
  components: {
    WalletAvatar,
  },
})
export default class WalletAccount extends Mixins(TranslationMixin) {
  @Getter account!: Account;
  @Action logout!: AsyncVoidFn;
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  @Prop({ default: false, type: Boolean }) readonly showControls!: boolean;
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

  async handleCopyAddress(event: Event): Promise<void> {
    event.stopImmediatePropagation();
    try {
      await copyToClipboard(this.address);
      this.$notify({
        message: this.t('account.successCopy'),
        type: 'success',
        title: '',
      });
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: '',
      });
    }
  }

  handleSwitchAccount(): void {
    const navigationArgs = {
      name: RouteNames.WalletConnection,
      params: { isAccountSwitch: true },
    };
    this.navigate(navigationArgs);
    // this.logout();
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
  &__action-button {
    & + & {
      margin-left: var(--s-basic-spacing);
    }
  }
  &-switch {
    padding: 0;
  }
}
</style>

<style lang="scss">
.account-menu i:hover {
  color: var(--s-color-theme-accent);
}
</style>
