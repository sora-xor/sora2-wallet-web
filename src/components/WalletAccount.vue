<template>
  <s-card :bodyStyle="{ padding: '0 12px' }" class="wallet-account" border-radius="mini">
    <div class="account s-flex">
      <div class="account-avatar" />
      <div class="account-details s-flex">
        <div class="account-credentials s-flex">
          <div v-if="(polkadotAccount || account).name" class="account-credentials_name">{{ (polkadotAccount || account).name }}</div>
          <s-tooltip :content="t('account.copy')">
            <div class="account-credentials_address" @click="handleCopyAddress($event)">{{ formatAddress((polkadotAccount || account).address) }}</div>
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
import { copyToClipboard, formatAddress } from '../util'

@Component
export default class WalletAccount extends Mixins(TranslationMixin) {
  @Getter account!: any
  @Action logout
  @Action navigate

  @Prop({ default: false, type: Boolean }) readonly showControls!: boolean
  @Prop({ default: () => null, type: Object }) readonly polkadotAccount!: { name: string; address: string }

  async handleCopyAddress (event: Event): Promise<void> {
    event.stopImmediatePropagation()
    try {
      await copyToClipboard(this.account.address)
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

  formatAddress (address: string): string {
    return formatAddress(address, 24)
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

$avatar-size: 32px;
$button-margin: 10px;

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
    margin-right: $basic-spacing_small;
    background-image: $avatar-default-svg;
    width: $avatar-size;
    height: $avatar-size;
  }
  &-details {
    flex: 1;
  }
  &-credentials {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    &_name,
    &_address {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &_name {
      font-size: $font-size_basic;
      outline: none;
      white-space: nowrap;
    }
    &_address {
      width: fit-content;
      outline: none;
      @include hint-text;
      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
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
