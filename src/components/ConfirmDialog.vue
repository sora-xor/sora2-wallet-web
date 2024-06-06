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
import { Component, Mixins, Prop } from 'vue-property-decorator';

import { api } from '../api';
import { getter, action, state, mutation } from '../store/decorators';
import { delay } from '../util';
import { unlockAccountPair } from '../util/account';

import AccountConfirmDialog from './Account/ConfirmDialog.vue';
import LoadingMixin from './mixins/LoadingMixin';
import NotificationMixin from './mixins/NotificationMixin';

import type { ApiAccount } from '@sora-substrate/util';

@Component({
  components: {
    AccountConfirmDialog,
  },
})
export default class ConfirmDialog extends Mixins(NotificationMixin, LoadingMixin) {
  @Prop({ required: true, type: String }) private connected!: string;
  @Prop({ required: true, type: Function }) private getApi!: () => ApiAccount;

  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;
  @state.transactions.isSignTxDialogVisible private isSignTxDialogVisible!: boolean;
  @mutation.transactions.setSignTxDialogVisibility private setSignTxDialogVisibility!: (flag: boolean) => void;

  @getter.account.getPassword private getPassword!: (accountAddress: string) => Nullable<string>;

  @action.account.setAccountPassphrase private setAccountPassphrase!: (opts: {
    address: string;
    password: string;
  }) => void;

  @action.account.resetAccountPassphrase private resetAccountPassphrase!: (address: string) => void;

  get visibility(): boolean {
    return this.isSignTxDialogVisible;
  }

  set visibility(flag: boolean) {
    this.setSignTxDialogVisibility(flag);
  }

  get passphrase(): Nullable<string> {
    return this.getPassword(this.connected);
  }

  async handleConfirm(password: string): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        unlockAccountPair(this.getApi(), password);

        if (this.isSignTxDialogDisabled) {
          this.setAccountPassphrase({ address: this.connected, password });
        } else {
          this.resetAccountPassphrase(this.connected);
        }

        this.setSignTxDialogVisibility(false);
      });
    });
  }
}
</script>
