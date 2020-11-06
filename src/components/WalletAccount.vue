<template>
  <s-card :bodyStyle="{ padding: '0 12px' }">
    <div class="account s-flex">
      <div class="account-avatar" />
      <div class="account-credentials">
        <div v-if="name" class="account-credentials_name">{{ name }}</div>
        <div class="account-credentials_address">{{ account.address }}</div>
      </div>
      <s-button class="account-copy" size="medium" type="link" icon="copy" @click="handleCopyAddress" />
      <s-dropdown
        v-if="showMenu"
        class="account-menu"
        type="ellipsis"
        icon="more-vertical"
        placement="bottom"
        @select="handleMenuSelect"
      >
        {{ t('account.menu.tooltip') }}
        <template slot="menu">
          <s-dropdown-item
            v-for="menuItem in AccountMenu"
            :key="menuItem"
            :value="menuItem"
          >
            <span>{{ t(`account.menu.${menuItem}`) }}</span>
          </s-dropdown-item>
        </template>
      </s-dropdown>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { AccountMenu, RouteNames } from '../consts'
import { copyToClipboard } from '../util'

@Component
export default class WalletAccount extends Mixins(TranslationMixin) {
  readonly AccountMenu = AccountMenu

  @Getter account!: any
  @Action logout
  @Action navigate

  @Prop({ default: '', type: String }) readonly name!: string
  @Prop({ default: false, type: Boolean }) readonly showMenu!: boolean

  async handleCopyAddress (): Promise<void> {
    try {
      await copyToClipboard(this.account.address)
      this.$notify({
        message: this.t('account.successCopy'),
        title: this.t('successText'),
        type: 'success'
      })
    } catch (error) {
      this.$notify({
        message: error,
        title: this.t('warningText'),
        type: 'warning'
      })
    }
  }

  handleMenuSelect (selected: AccountMenu): void {
    switch (selected) {
      case AccountMenu.View:
      case AccountMenu.Edit:
        break
      case AccountMenu.Logout:
        this.navigate({ name: RouteNames.WalletConnection })
        this.logout()
        break
    }
  }
}
</script>

<style scoped lang="scss">
@import '../styles/typography';
@import '../styles/layout';
@import '../styles/variables';
@import '../styles/soramitsu-variables';

$avatar-default-svg: url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z' fill='white'/%3E%3Cellipse cx='16.0001' cy='4.79999' rx='2.4' ry='2.4' fill='%2331DF57'/%3E%3Ccircle cx='11.2' cy='7.19999' r='2.4' fill='%239A1892'/%3E%3Cellipse cx='20.7999' cy='7.19999' rx='2.4' ry='2.4' fill='%2331DF57'/%3E%3Cellipse cx='16.0001' cy='10.4' rx='2.4' ry='2.4' fill='%230A2342'/%3E%3Cellipse cx='25.6' cy='10.4' rx='2.4' ry='2.4' fill='%232D4DDC'/%3E%3Ccircle cx='6.4' cy='10.4' r='2.4' fill='%232D4DDC'/%3E%3Ccircle cx='11.2' cy='12.8' r='2.4' fill='%23EB90EB'/%3E%3Cellipse cx='20.7999' cy='12.8' rx='2.4' ry='2.4' fill='%23EB90EB'/%3E%3Ccircle cx='16.0001' cy='21.6' r='2.4' fill='%23EB90EB'/%3E%3Ccircle cx='25.6' cy='21.6' r='2.4' fill='%2331DF57'/%3E%3Cellipse cx='6.4' cy='21.6' rx='2.4' ry='2.4' fill='%2331DF57'/%3E%3Cellipse cx='11.2' cy='24' rx='2.4' ry='2.4' fill='%239A1892'/%3E%3Cellipse cx='20.7999' cy='24' rx='2.4' ry='2.4' fill='%2331DF57'/%3E%3Cellipse cx='16.0001' cy='27.2' rx='2.4' ry='2.4' fill='%232D4DDC'/%3E%3Ccircle cx='16.0001' cy='16' r='2.4' fill='%23433F10'/%3E%3Ccircle cx='25.6' cy='16' r='2.4' fill='%239A1892'/%3E%3Cellipse cx='6.4' cy='16' rx='2.4' ry='2.4' fill='%2331DF57'/%3E%3Cellipse cx='11.2' cy='18.4' rx='2.4' ry='2.4' fill='%230A2342'/%3E%3Cellipse cx='20.7999' cy='18.4' rx='2.4' ry='2.4' fill='%230A2342'/%3E%3Cpath d='M16 31C7.71573 31 1 24.2843 1 16H-1C-1 25.3888 6.61116 33 16 33V31ZM31 16C31 24.2843 24.2843 31 16 31V33C25.3888 33 33 25.3888 33 16H31ZM16 1C24.2843 1 31 7.71573 31 16H33C33 6.61116 25.3888 -1 16 -1V1ZM16 -1C6.61116 -1 -1 6.61116 -1 16H1C1 7.71573 7.71573 1 16 1V-1Z' fill='%23DDE0E1'/%3E%3C/svg%3E");
$avatar-size: 32px;

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}
.account {
  margin: $basic-spacing_mini 0;
  &-avatar {
    margin-right: $basic-spacing_small;
    background-image: $avatar-default-svg;
    width: $avatar-size;
    height: $avatar-size;
  }
  &-credentials {
    max-width: 75%;
    flex-direction: column;
    justify-content: center;
    &_name {
      font-size: $font-size_basic;
      @include text-ellipsis;
    }
    &_address {
      color: $s-color-base-content-tertiary;
      font-size: $font-size_small;
      @include text-ellipsis;
    }
  }
  &-copy {
    flex: 1;
    padding: 0;
    text-align: right;
  }
  &-menu {
    align-self: center;
  }
}
</style>
