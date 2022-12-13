<template>
  <dialog-base :title="t('desktop.dialog.confirmTitle')" :visible.sync="visibility">
    <div class="confirm-dialog">
      <wallet-account class="confirm-dialog__account" />
      <s-input
        :type="inputType"
        :placeholder="t('desktop.password.placeholder')"
        v-model="password"
        :disabled="isInputDisabled"
        class="confirm-dialog__password"
      >
        <s-icon
          v-if="!passphrase"
          :name="iconPasswordStyle"
          class="eye-icon"
          size="18"
          slot="suffix"
          @click.native="togglePasswordVisibility"
        />
      </s-input>
      <div class="confirm-dialog__save-password">
        <s-switch v-model="savePassword" />
        <span v-if="!passphrase">{{ t('desktop.dialog.savePasswordText') }}</span>
        <span v-else>{{ t('desktop.dialog.extendPasswordText') }}</span>
      </div>
      <s-button
        type="primary"
        class="confirm-dialog__button"
        :disabled="disabled"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ t('desktop.dialog.confirmButton') }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import DialogBase from './DialogBase.vue';
import WalletAccount from './WalletAccount.vue';

import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';

import { getter, action, state, mutation } from '../store/decorators';
import { api } from '../api';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class ConfirmDialog extends Mixins(TranslationMixin, LoadingMixin) {
  @state.transactions.isConfirmTxDialogVisible private isConfirmTxDialogVisible!: boolean;
  @getter.account.passphrase passphrase!: Nullable<string>;
  @mutation.transactions.setConfirmTxDialogVisibility private setConfirmTxDialogVisibility!: (flag: boolean) => void;
  @mutation.transactions.approveTxViaConfirmTxDialog private approveTxViaConfirmTxDialog!: VoidFn;
  @mutation.transactions.resetTxApprovedViaConfirmTxDialog private resetTxApprovedViaConfirmTxDialog!: VoidFn;
  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => Promise<void>;

  get visibility(): boolean {
    return this.isConfirmTxDialogVisible;
  }

  set visibility(flag: boolean) {
    this.setupFormState();
    this.setConfirmTxDialogVisibility(flag);
  }

  password = '';

  savePassword = true;
  hiddenInput = true;

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get disabled(): boolean {
    return this.loading || !this.password;
  }

  get isInputDisabled(): boolean {
    return this.loading || !!this.passphrase;
  }

  togglePasswordVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  private confirm(): void {
    try {
      api.unlockPair(this.password);
    } catch (error: any) {
      if (error.message === 'Unable to decode using the supplied passphrase') {
        this.$notify({
          message: this.t('desktop.errorMessages.password'),
          type: 'error',
          title: '',
        });
      } else {
        this.$notify({
          message: this.t('unknownErrorText'),
          type: 'error',
          title: '',
        });
      }

      this.setConfirmTxDialogVisibility(false);
      return;
    }

    if (this.savePassword) {
      this.setAccountPassphrase(this.passphrase || this.password);
    }

    this.approveTxViaConfirmTxDialog();
    this.setConfirmTxDialogVisibility(false);
  }

  handleConfirm(): void {
    this.withLoading(this.confirm);
  }

  private setupFormState(): void {
    if (this.visibility) {
      this.resetTxApprovedViaConfirmTxDialog();
    }
    if (this.passphrase) {
      this.password = this.passphrase;
    } else if (this.visibility === false) {
      this.password = '';
    }
  }

  mounted(): void {
    this.setupFormState();
  }
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  &__password {
    margin-top: calc(var(--s-size-small) / 2);
  }

  &__save-password {
    margin-top: calc(var(--s-size-small) / 2);
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
  }

  &__button {
    margin: calc(var(--s-size-small) / 2) 0;
    width: 100%;
  }

  .eye-icon {
    color: var(--s-color-base-content-tertiary);
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
