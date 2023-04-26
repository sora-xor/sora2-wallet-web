<template>
  <div>
    <div class="connection">
      <p v-if="text" class="connection__text">
        {{ text }}
      </p>

      <account-list @select="handleSelectAccount" class="connection__accounts">
        <template #menu="account">
          <account-actions-menu :actions="accountActions" @select="handleAccountAction($event, account)" />
        </template>
      </account-list>

      <connection-items>
        <account-card class="connection__button" v-button tabindex="0" @click.native="handleCreateAccount">
          <template #avatar>
            <s-icon name="basic-circle-plus-24" size="28" class="connection__button-icon" />
          </template>
          <template #name>{{ t('desktop.button.createAccount') }}</template>
        </account-card>
        <account-card class="connection__button" v-button tabindex="0" @click.native="handleImportAccount">
          <template #avatar>
            <s-icon name="el-icon-link" size="28" class="connection__button-icon" />
          </template>
          <template #name>{{ t('desktop.button.importAccount') }}</template>
        </account-card>
      </connection-items>
    </div>

    <account-rename-dialog
      :account="selectedAccount"
      :visible.sync="accountRenameVisibility"
      :loading="loading"
      @confirm="handleAccountRename"
    />
    <account-export-dialog
      :account="selectedAccount"
      :visible.sync="accountExportVisibility"
      :loading="loading"
      @confirm="handleAccountExport"
    />
    <account-delete-dialog :visible.sync="accountDeleteVisibility" :loading="loading" @confirm="handleAccountDelete" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import AccountActionsMixin from '../../mixins/AccountActionsMixin';

import AccountList from '../AccountList.vue';
import AccountCard from '../../Account/AccountCard.vue';
import AccountActionsMenu from '../../Account/ActionsMenu.vue';
import AccountRenameDialog from '../../Account/RenameDialog.vue';
import AccountExportDialog from '../../Account/ConfirmDialog.vue';
import AccountDeleteDialog from '../../Account/DeleteDialog.vue';
import ConnectionItems from '../ConnectionItems.vue';

import { AccountActionTypes } from '../../../consts';

import type { PolkadotJsAccount } from '../../../types/common';

@Component({
  components: {
    AccountList,
    AccountCard,
    AccountActionsMenu,
    AccountRenameDialog,
    AccountExportDialog,
    AccountDeleteDialog,
    ConnectionItems,
  },
})
export default class AccountListStep extends Mixins(AccountActionsMixin) {
  @Prop({ default: '', type: String }) readonly text!: string;

  readonly accountActions = [AccountActionTypes.Rename, AccountActionTypes.Export, AccountActionTypes.Delete];

  handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): void {
    this.$emit('select', account, isConnected);
  }

  handleCreateAccount(): void {
    this.$emit('create');
  }

  handleImportAccount(): void {
    this.$emit('import');
  }
}
</script>

<style scoped lang="scss">
.connection {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-medium;

  &__text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }

  &__button {
    &-icon {
      color: var(--s-color-base-content-tertiary);
    }

    &:hover,
    &:focus,
    &:active {
      .connection__button-icon {
        color: var(--s-color-base-content-secondary);
      }
    }
  }
}
</style>
