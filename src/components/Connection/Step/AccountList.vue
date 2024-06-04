<template>
  <div>
    <div class="connection">
      <p v-if="text" class="connection__text">
        {{ text }}
      </p>

      <account-connection-list
        :accounts="accounts"
        :wallet="selectedWallet"
        :is-connected="isConnectedAccount"
        @select="handleSelectAccount"
        class="connection__accounts"
      >
        <template v-if="isInternal" #menu="account">
          <account-actions-menu :actions="accountActions" @select="handleAccountAction($event, account)" />
        </template>
      </account-connection-list>

      <connection-items v-if="isInternal">
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

      <s-button
        v-else-if="noAccounts"
        class="connection__button s-typography-button--large"
        type="primary"
        :loading="loading"
        @click="handleRefreshClick"
      >
        {{ t('connection.action.refresh') }}
      </s-button>
    </div>

    <template v-if="isInternal">
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
      <account-delete-dialog
        :visible.sync="accountDeleteVisibility"
        :loading="loading"
        @confirm="handleAccountDelete"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import { AccountActionTypes } from '../../../consts';
import AccountCard from '../../Account/AccountCard.vue';
import AccountActionsMenu from '../../Account/ActionsMenu.vue';
import AccountExportDialog from '../../Account/ConfirmDialog.vue';
import AccountDeleteDialog from '../../Account/DeleteDialog.vue';
import AccountRenameDialog from '../../Account/RenameDialog.vue';
import AccountActionsMixin from '../../mixins/AccountActionsMixin';
import AccountConnectionList from '../List/Account.vue';
import ConnectionItems from '../List/ConnectionItems.vue';

import type { PolkadotJsAccount } from '../../../types/common';

@Component({
  components: {
    AccountConnectionList,
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
  @Prop({ default: false, type: Boolean }) readonly isInternal!: boolean;
  @Prop({ default: () => [], type: Array }) readonly accounts!: Array<PolkadotJsAccount>;

  readonly accountActions = [AccountActionTypes.Rename, AccountActionTypes.Export, AccountActionTypes.Delete];

  get noAccounts(): boolean {
    return !this.accounts.length;
  }

  handleRefreshClick(): void {
    window.history.go();
  }

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
