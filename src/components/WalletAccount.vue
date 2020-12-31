<template>
  <s-card :bodyStyle="{ padding: '0 12px' }" class="wallet-account" border-radius="mini" shadow="never">
    <div class="account s-flex">
      <div class="account-avatar" />
      <div class="account-credentials s-flex">
        <div
          ref="editNameEl"
          v-if="name"
          class="account-credentials_name"
          :contenteditable="isEditNameOperation"
          @keydown.enter.prevent
          @input="handleNameChange"
          @blur="handleNameInputBlur"
        >
          {{ name }}
        </div>
        <div class="account-credentials_address">{{ formatAddress(account.address) }}</div>
      </div>
      <s-button class="account-copy" size="medium" type="link" icon="copy" @click="handleCopyAddress" />
      <s-dropdown
        v-if="showMenu"
        class="account-menu"
        borderRadius="mini"
        type="ellipsis"
        icon="more-vertical"
        placement="bottom-end"
        @select="handleMenuSelect"
      >
        {{ t('account.menu.tooltip') }}
        <template slot="menu">
          <s-dropdown-item
            v-for="menuItem in AccountMenu"
            :key="menuItem"
            :value="menuItem"
            :disabled="/* TODO: coming soon */ menuItem === AccountMenu.View"
          >
            <span>{{ t(`account.menu.${menuItem}`) }}</span>
          </s-dropdown-item>
        </template>
      </s-dropdown>
    </div>
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Ref } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { AccountMenu, RouteNames } from '../consts'
import { copyToClipboard, formatAddress } from '../util'

@Component
export default class WalletAccount extends Mixins(TranslationMixin) {
  readonly AccountMenu = AccountMenu

  @Getter account!: any
  @Action logout
  @Action navigate
  @Action changeName

  @Prop({ default: '', type: String }) readonly name!: string
  @Prop({ default: false, type: Boolean }) readonly showMenu!: boolean
  @Ref('editNameEl') editNameEl!: HTMLDivElement

  accountName = this.name
  isEditNameOperation = false

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

  async handleMenuSelect (selected: AccountMenu): Promise<void> {
    switch (selected) {
      case AccountMenu.View:
        break
      case AccountMenu.Edit:
        await this.enableNameEdit()
        break
      case AccountMenu.Logout:
        this.navigate({ name: RouteNames.WalletConnection })
        this.logout()
        break
    }
  }

  handleNameInputBlur (): void {
    this.isEditNameOperation = false
    this.changeName({ newName: this.accountName })
  }

  handleNameChange (e: any): void {
    const newName = e.target.innerText
    this.accountName = newName
    if (!newName) {
      this.editNameEl.innerText = this.name
    }
  }

  formatAddress (address: string): string {
    return formatAddress(address, 14)
  }

  private async enableNameEdit (): Promise<void> {
    this.isEditNameOperation = true
    await new Promise(resolve => setTimeout(resolve, 10))
    const range = document.createRange()
    range.selectNodeContents(this.editNameEl)
    range.collapse(false)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../styles/icons';

$avatar-size: 32px;

.wallet-account.s-card {
  box-shadow: none;
  border: 1px solid var(--s-color-base-border-primary);
}

.s-card {
  @include s-card-styles;
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
      @include hint-text;
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

<style lang="scss">
.account-menu i:hover {
  color: var(--s-color-theme-accent);
}
</style>
