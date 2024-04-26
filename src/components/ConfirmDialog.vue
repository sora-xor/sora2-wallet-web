<template>
  <account-confirm-dialog
    with-timeout
    :visible.sync="visibility"
    :loading="loading"
    :passphrase="passphrase"
    :confirm-button-text="t('desktop.dialog.confirmButton')"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { getter, action, state, mutation } from '../store/decorators';
import { delay } from '../util';

import AccountConfirmDialog from './Account/ConfirmDialog.vue';
import LoadingMixin from './mixins/LoadingMixin';
import NotificationMixin from './mixins/NotificationMixin';

@Component({
  components: {
    AccountConfirmDialog,
  },
})
export default class ConfirmDialog extends Mixins(NotificationMixin, LoadingMixin) {
  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;
  @state.transactions.isSignTxDialogVisible private isSignTxDialogVisible!: boolean;
  @getter.account.passphrase passphrase!: Nullable<string>;
  @mutation.transactions.setSignTxDialogVisibility private setSignTxDialogVisibility!: (flag: boolean) => void;
  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => void;
  @action.account.resetAccountPassphrase private resetAccountPassphrase!: FnWithoutArgs;
  @action.account.unlockAccountPair private unlockAccountPair!: (passphrase: string) => void;

  get visibility(): boolean {
    return this.isSignTxDialogVisible;
  }

  set visibility(flag: boolean) {
    this.setSignTxDialogVisibility(flag);
  }

  async handleConfirm(password: string): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        this.unlockAccountPair(password);

        if (this.isSignTxDialogDisabled) {
          this.setAccountPassphrase(password);
        } else {
          this.resetAccountPassphrase();
        }

        this.setSignTxDialogVisibility(false);
      });
    });
  }
}
</script>
