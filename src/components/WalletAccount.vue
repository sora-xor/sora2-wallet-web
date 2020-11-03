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

$avatar-size: 32px;

@mixin text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
}
.account {
  margin: $basic-spacing_mini 0;
  &-avatar {
    margin-right: $basic-spacing_small;
    background-image: url('../assets/img/avatar-default.svg'); // TODO: fix this import when using it externally
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
