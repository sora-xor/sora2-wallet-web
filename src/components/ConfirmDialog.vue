<template>
  <account-confirm-dialog
    save-passphrase
    :visible.sync="visibility"
    :loading="loading"
    :passphrase="passphrase"
    :confirm-button-text="t('desktop.dialog.confirmButton')"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import AccountConfirmDialog from './Account/ConfirmDialog.vue';

import NotificationMixin from './mixins/NotificationMixin';
import LoadingMixin from './mixins/LoadingMixin';

import { getter, action, state, mutation } from '../store/decorators';
import { delay } from '../util';
import { api } from '../api';

@Component({
  components: {
    AccountConfirmDialog,
  },
})
export default class ConfirmDialog extends Mixins(NotificationMixin, LoadingMixin) {
  @state.transactions.isConfirmTxDialogVisible private isConfirmTxDialogVisible!: boolean;
  @getter.account.passphrase passphrase!: Nullable<string>;
  @mutation.transactions.setConfirmTxDialogVisibility private setConfirmTxDialogVisibility!: (flag: boolean) => void;
  @mutation.transactions.approveTxViaConfirmTxDialog private approveTxViaConfirmTxDialog!: FnWithoutArgs;
  @mutation.transactions.resetTxApprovedViaConfirmTxDialog private resetTxApprovedViaConfirmTxDialog!: FnWithoutArgs;
  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => Promise<void>;

  get visibility(): boolean {
    return this.isConfirmTxDialogVisible;
  }

  set visibility(flag: boolean) {
    this.setupFormState();
    this.setConfirmTxDialogVisibility(flag);
  }

  async handleConfirm({ password, save }: { password: string; save: boolean }): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        api.unlockPair(password);

        if (save) {
          this.setAccountPassphrase(password);
        }

        this.approveTxViaConfirmTxDialog();
        this.setConfirmTxDialogVisibility(false);
      });
    });
  }

  private setupFormState(): void {
    if (this.visibility) {
      this.resetTxApprovedViaConfirmTxDialog();
    }
  }

  mounted(): void {
    this.setupFormState();
  }
}
</script>
