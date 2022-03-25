<template>
  <dialog-base :title="t('desktop.dialog.confirmTitle')" :visible.sync="isVisible">
    <div class="confirm-dialog">
      <wallet-account class="confirm-dialog__account" />
      <s-input
        :type="inputType"
        :placeholder="t('desktop.password.placeholder')"
        v-model="accountPassword"
        :disabled="loading || isInputDisabled"
        class="confirm-dialog__password"
      >
        <s-icon
          v-if="!passphrase"
          :name="iconPasswordStyle"
          class="eye-icon"
          size="18"
          slot="suffix"
          @click.native="toggleVisibility"
        />
      </s-input>
      <div class="confirm-dialog__save-password">
        <s-switch v-model="savePassword" />
        <span v-if="!passphrase">{{ t('desktop.dialog.savePasswordText') }}</span>
        <span v-else>Extend period without password by 15 minutes</span>
      </div>
      <s-button @click="handleConfirm" type="primary" class="confirm-dialog__button" :disabled="disabled">
        {{ t('desktop.dialog.confirmButton') }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import DialogBase from './DialogBase.vue';
import WalletAccount from './WalletAccount.vue';
import DialogMixin from './mixins/DialogMixin';
import TranslationMixin from './mixins/TranslationMixin';
import LoadingMixin from './mixins/LoadingMixin';
import { api } from '../api';
import { Action, Getter } from 'vuex-class';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class ConfirmDialog extends Mixins(DialogMixin, TranslationMixin, LoadingMixin) {
  @Getter passphrase!: string | null;
  @Action setAccountPassphrase!: (passphrase: string) => AsyncVoidFn;

  accountPassword = '';

  savePassword = true;
  hiddenInput = true;

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get disabled(): boolean {
    return !this.accountPassword;
  }

  get isInputDisabled(): boolean {
    return !!this.passphrase;
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  handleConfirm(): void {
    try {
      api.unlockPair(this.accountPassword);
    } catch (error) {
      if (error.message === 'Unable to decode using the supplied passphrase') {
        this.$notify({
          message: `Password did not match`,
          type: 'error',
          title: '',
        });
      }

      this.accountPassword = '';
      return;
    }

    if (!this.passphrase && this.savePassword) {
      this.setAccountPassphrase(this.accountPassword);
    } else if (this.passphrase && this.savePassword) {
      this.setAccountPassphrase(this.passphrase);
    }

    this.$emit('confirm');
    this.closeDialog();
    this.accountPassword = '';
  }

  setupFormState(): void {
    if (this.passphrase) {
      this.accountPassword = this.passphrase;
    } else if (this.isVisible === false) {
      this.accountPassword = '';
    }
  }

  mounted(): void {
    this.setupFormState();
  }

  updated(): void {
    this.setupFormState();
  }
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  &__password {
    margin-top: 16px;
  }

  &__save-password {
    margin-top: 16px;
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
  }

  &__button {
    margin: 16px 0;
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
