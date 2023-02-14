<template>
  <div class="account-actions">
    <s-dropdown
      type="ellipsis"
      border-radius="mini"
      icon="basic-more-vertical-24"
      class="account-actions"
      @select="handleSelect"
    >
      <template slot="menu">
        <s-dropdown-item v-for="{ value, name, icon } in items" :key="value" :value="value" :icon="icon">
          {{ name }}
        </s-dropdown-item>
      </template>
    </s-dropdown>

    <account-rename-dialog :visible.sync="accountRenameVisibility" :laoding="loading" @confirm="handleAccountRename" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import LoadingMixin from '../mixins/LoadingMixin';

import AccountRenameDialog from './RenameDialog.vue';

import { action } from '../../store/decorators';

enum AccountActionTypes {
  Rename = 'rename',
  Export = 'export',
  Logout = 'logout',
  Delete = 'delete',
}

@Component({
  components: {
    AccountRenameDialog,
  },
})
export default class AccountActions extends Mixins(LoadingMixin) {
  @action.account.renameAccount renameAccount!: (name: string) => Promise<void>;
  @action.account.logout private logout!: AsyncFnWithoutArgs;

  accountRenameVisibility = false;

  get items() {
    return [
      {
        value: AccountActionTypes.Rename,
        name: 'Rename Account',
        icon: 'basic-options-24',
      },
      {
        value: AccountActionTypes.Export,
        name: 'Export .json',
        icon: 'basic-pulse-24',
      },
      {
        value: AccountActionTypes.Logout,
        name: 'Log out',
        icon: 'security-logout-24',
      },
      {
        value: AccountActionTypes.Delete,
        name: 'Delete Account',
        icon: 'paperclip-16',
      },
    ];
  }

  handleSelect(actionType: string): void {
    switch (actionType) {
      case AccountActionTypes.Rename: {
        this.accountRenameVisibility = true;
        break;
      }
      case AccountActionTypes.Logout: {
        this.logout();
      }
    }
  }

  async handleAccountRename(name: string) {
    await this.withLoading(async () => {
      await this.renameAccount(name);
      this.accountRenameVisibility = false;
    });
  }
}
</script>

<style lang="scss">
.account-actions {
  &.el-dropdown {
    color: inherit;

    i.el-tooltip.el-dropdown-selfdefine {
      color: inherit;
    }
  }
}
</style>

<style lang="scss" scoped>
.account-actions {
  display: flex;
  color: var(--s-color-base-content-tertiary);
}
</style>
