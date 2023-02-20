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
        <s-dropdown-item
          v-for="{ value, name, icon, status } in items"
          :key="value"
          :value="value"
          :icon="icon"
          :class="['account-actions__item', status]"
        >
          {{ name }}
        </s-dropdown-item>
      </template>
    </s-dropdown>

    <account-rename-dialog :visible.sync="accountRenameVisibility" :loading="loading" @confirm="handleAccountRename" />
    <account-export-dialog :visible.sync="accountExportVisibility" :loading="loading" @confirm="handleAccountExport" />
    <account-delete-dialog :visible.sync="accountDeleteVisibility" @confirm="handleAccountDelete" />
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import LoadingMixin from '../mixins/LoadingMixin';
import NotificationMixin from '../mixins/NotificationMixin';

import AccountRenameDialog from './RenameDialog.vue';
import AccountExportDialog from './ConfirmDialog.vue';
import AccountDeleteDialog from './DeleteDialog.vue';

import { action } from '../../store/decorators';

import { delay } from '../../util';
import { settingsStorage } from '../../util/storage';

enum AccountActionTypes {
  Rename = 'rename',
  Export = 'export',
  Logout = 'logout',
  Delete = 'delete',
}

@Component({
  components: {
    AccountRenameDialog,
    AccountExportDialog,
    AccountDeleteDialog,
  },
})
export default class AccountActions extends Mixins(NotificationMixin, LoadingMixin) {
  @action.account.renameAccount private renameAccount!: (name: string) => Promise<void>;
  @action.account.exportAccount private exportAccount!: (password: string) => Promise<void>;
  @action.account.logout private logout!: (forgetAccount?: boolean) => Promise<void>;

  accountRenameVisibility = false;
  accountExportVisibility = false;
  accountDeleteVisibility = false;

  get items() {
    return [
      {
        value: AccountActionTypes.Rename,
        name: this.t('account.rename'),
        icon: 'basic-options-24',
      },
      {
        value: AccountActionTypes.Export,
        name: this.t('account.export'),
        icon: 'basic-pulse-24',
      },
      {
        value: AccountActionTypes.Logout,
        name: this.t('logoutText'),
        icon: 'security-logout-24',
      },
      {
        value: AccountActionTypes.Delete,
        name: this.t('account.delete'),
        icon: 'paperclip-16',
        status: 'error',
      },
    ];
  }

  handleSelect(actionType: string): void {
    switch (actionType) {
      case AccountActionTypes.Rename: {
        this.accountRenameVisibility = true;
        break;
      }
      case AccountActionTypes.Export: {
        this.accountExportVisibility = true;
        break;
      }
      case AccountActionTypes.Logout: {
        this.logout();
        break;
      }
      case AccountActionTypes.Delete: {
        const storageValue = settingsStorage.get('allowAccountDeletePopup');
        const popupVisibility = storageValue ? Boolean(JSON.parse(storageValue)) : true;

        if (popupVisibility) {
          this.accountDeleteVisibility = true;
        } else {
          this.handleAccountDelete();
        }
        break;
      }
    }
  }

  async handleAccountRename(name: string): Promise<void> {
    await this.withLoading(async () => {
      await this.withAppNotification(async () => {
        await this.renameAccount(name);
        this.accountRenameVisibility = false;
      });
    });
  }

  async handleAccountExport({ password }: { password: string }): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);

      await this.withAppNotification(async () => {
        await this.exportAccount(password);
        this.accountExportVisibility = false;
      });
    });
  }

  handleAccountDelete(allowAccountDeletePopup = true): void {
    if (!allowAccountDeletePopup) {
      settingsStorage.set('allowAccountDeletePopup', false);
    }
    this.accountDeleteVisibility = false;
    this.logout(true);
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

  &__item.el-dropdown-menu__item {
    color: var(--s-color-base-content-primary);

    & > i {
      color: var(--s-color-base-content-tertiary);
    }

    &.error {
      &,
      &:hover,
      &:focus,
      &:active {
        color: var(--s-color-status-error);
        & > i {
          color: inherit;
        }
      }
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
