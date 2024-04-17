<template>
  <dialog-base
    :title="t('desktop.dialog.confirmTitle')"
    :visible.sync="isVisible"
    class="confirm-dialog"
    append-to-body
  >
    <s-form class="confirm-dialog__form" @submit.native.prevent="handleConfirm">
      <wallet-account :polkadot-account="account" />
      <password-input v-if="!passphrase" ref="passwordInput" v-model="password" :disabled="loading" autofocus />
      <div
        v-if="savePassphrase && !(passphrase && isUnlimitedPassphraseDuration)"
        class="confirm-dialog__save-password"
      >
        <s-switch v-model="savePassword" />
        <span v-if="!passphrase">{{ t('desktop.dialog.savePasswordText', { duration: passphraseTimeout }) }}</span>
        <span v-else>{{ t('desktop.dialog.extendPasswordText', { duration: passphraseTimeout }) }}</span>
      </div>
      <s-button
        type="primary"
        native-type="submit"
        class="confirm-dialog__button"
        :disabled="isConfirmDisabled"
        :loading="loading"
      >
        {{ confirmText }}
      </s-button>
    </s-form>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch, Ref } from 'vue-property-decorator';

import { ObjectInit, PassphraseTimeout } from '../../consts';
import DialogBase from '../DialogBase.vue';
import PasswordInput from '../Input/Password.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import WalletAccount from './WalletAccount.vue';

import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    WalletAccount,
    PasswordInput,
  },
})
export default class AccountConfirmDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly account!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: false, type: Boolean }) readonly savePassphrase!: boolean;
  @Prop({ default: '', type: String }) readonly passphrase!: string;
  @Prop({ default: '', type: String }) readonly passphraseTimeout!: PassphraseTimeout;
  @Prop({ default: '', type: String }) readonly confirmButtonText!: string;

  @Ref('passwordInput') readonly passwordInput!: any;

  @Watch('isVisible')
  private setupFormState(visibility: boolean): void {
    if (!visibility) {
      this.model = '';
      this.passwordInput?.reset();
    } else {
      this.$nextTick(() => {
        this.passwordInput?.focus();
      });
    }
  }

  model = '';
  savePassword = true;

  get password(): string {
    return this.passphrase || this.model;
  }

  set password(value: string) {
    this.model = value;
  }

  get isUnlimitedPassphraseDuration(): boolean {
    return this.passphraseTimeout === PassphraseTimeout.UNLIMITED;
  }

  get confirmText(): string {
    return this.confirmButtonText || this.t('confirmText');
  }

  get isConfirmDisabled(): boolean {
    return this.loading || !this.password;
  }

  handleConfirm(): void {
    this.$emit('confirm', {
      password: this.password,
      save: this.savePassphrase && this.savePassword,
    });
  }
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  &__form {
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing-medium;
  }

  &__save-password {
    @include switch-block;
    padding: 0 #{$basic-spacing-small};
  }

  &__button {
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
