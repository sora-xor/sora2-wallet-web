<template>
  <s-card :bodyStyle="{ padding: '0 12px' }" class="wallet-account" border-radius="mini">
    <div class="account s-flex">
      <wallet-avatar class="account-avatar" :address="address" />
      <div class="account-details s-flex">
        <div class="account-credentials s-flex">
          <div v-if="name" class="account-credentials_name">{{ name }}</div>
          <s-tooltip :content="t('account.copy')">
            <div class="account-credentials_address" @click="handleCopyAddress($event)">{{ formattedAddress }}</div>
          </s-tooltip>
        </div>
        <template v-if="showControls">
          <s-button
            class="account-switch"
            type="link"
            icon="arrows-refresh-ccw-24"
            :tooltip="t('account.switch')"
            @click="handleSwitchAccount"
          />
          <s-button
            class="account-logout"
            type="link"
            icon="security-logout-24"
            :tooltip="t('account.logout')"
            @click="handleLogout"
          />
        </template>
      </div>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { RouteNames } from '../consts'
import { copyToClipboard, formatAddress, formatSoraAddress } from '../util'
import WalletAvatar from './WalletAvatar.vue'

@Component({
  components: {
    WalletAvatar
  }
})
export default class WalletAccount extends Mixins(TranslationMixin) {
  @Getter account!: any
  @Action logout
  @Action navigate

  @Prop({ default: false, type: Boolean }) readonly showControls!: boolean
  @Prop({ default: () => null, type: Object }) readonly polkadotAccount!: { name: string; address: string }

  get address (): string {
    if (this.polkadotAccount) {
      return formatSoraAddress(this.polkadotAccount.address)
    }
    return this.account.address
  }

  get name (): string {
    return (this.polkadotAccount || this.account).name
  }

  get formattedAddress (): string {
    return formatAddress(this.address, 24)
  }

  async handleCopyAddress (event: Event): Promise<void> {
    event.stopImmediatePropagation()
    try {
      await copyToClipboard(this.address)
      this.$notify({
        message: this.t('account.successCopy'),
        type: 'success',
        title: ''
      })
    } catch (error) {
      this.$notify({
        message: `${this.t('warningText')} ${error}`,
        type: 'warning',
        title: ''
      })
    }
  }

  handleSwitchAccount (): void {
    this.navigate({ name: RouteNames.WalletConnection, params: { isAccountSwitch: true } })
    this.logout()
  }

  handleLogout (): void {
    this.navigate({ name: RouteNames.WalletConnection })
    this.logout()
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

$avatar-margin-right: $basic-spacing_small;
$avatar-size: 32px;
$account-button-width: 30px;
$account-button-margin-left: $button-margin;
$account-buttons-number: 2;

.wallet-account.s-card {
  box-shadow: none;
  border: 1px solid var(--s-color-base-border-primary);
}

.s-card {
  @include s-card-styles;
}

.account {
  margin: $basic-spacing_mini 0;
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
    width: calc(100% - #{$account-button-width * $account-buttons-number} - #{$account-button-margin-left * $account-buttons-number});
    &_name,
    &_address {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &_name {
      font-size: $font-size_basic;
      outline: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &_address {
      @include value-prefix(width, fit-content);
      outline: none;
      @include hint-text;
      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
  .el-button {
    margin-left: $account-button-margin-left;
    width: $account-button-width;
  }
  &-switch {
    margin-left: $button-margin;
  }
  &-switch, &-logout {
    padding: 0;
  }
}
</style>

<style lang="scss">
.account-menu i:hover {
  color: var(--s-color-theme-accent);
}
</style>
