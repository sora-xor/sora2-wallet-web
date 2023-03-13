<template>
  <div class="connection">
    <p v-if="text" class="connection__text">
      {{ text }}
    </p>

    <account-list @select="handleSelectAccount" class="connection__accounts">
      <template #menu="account">
        <account-actions-menu :actions="AccountActions" @select="handleAccountAction($event, account)" />
      </template>

      <account-card class="connection__button" v-button @click.native="handleCreateAccount">
        <template #avatar>
          <s-icon name="basic-circle-plus-24" size="32" />
        </template>
        <template #name>{{ t('desktop.button.createAccount') }}</template>
      </account-card>
      <account-card class="connection__button" v-button @click.native="handleImportAccount">
        <template #avatar>
          <s-icon name="basic-download-bold-24" size="32" />
        </template>
        <template #name>{{ t('desktop.button.importAccount') }}</template>
      </account-card>
    </account-list>

    <account-delete-dialog :visible.sync="accountDeleteVisibility" :loading="loading" @confirm="handleAccountDelete" />
  </div>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import AccountActionsMixin from '../../mixins/AccountActionsMixin';

import AccountList from '../AccountList.vue';
import AccountCard from '../../Account/AccountCard.vue';
import AccountActionsMenu from '../../Account/ActionsMenu.vue';
import AccountDeleteDialog from '../../Account/DeleteDialog.vue';

import { AccountActionTypes } from '../../../consts';

import type { PolkadotJsAccount } from '../../../types/common';

@Component({
  components: { AccountList, AccountCard, AccountActionsMenu, AccountDeleteDialog },
})
export default class AccountListStep extends Mixins(AccountActionsMixin) {
  @Prop({ default: '', type: String }) readonly text!: string;

  readonly AccountActions = [AccountActionTypes.Delete];

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
  & > * {
    &:not(:last-child) {
      margin-bottom: $basic-spacing-medium;
    }
  }

  &__text {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
    line-height: var(--s-line-height-base);
    color: var(--s-color-base-content-primary);
  }
}
</style>
