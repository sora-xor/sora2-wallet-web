<template>
  <dialog-base :title="t('desktop.dialog.confirmTitle')" :visible.sync="isVisible">
    <div class="confirm-dialog">
      <wallet-account />
      <s-input
        :type="passwordInputType"
        :placeholder="t('desktop.password.placeholder')"
        :disabled="isInputDisabled"
        v-model="password"
      >
        <s-icon
          v-if="!passphrase"
          :name="passwordIcon"
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
        :disabled="isConfirmDisabled"
        :loading="loading"
        @click="handleConfirm"
      >
        {{ confirmText }}
      </s-button>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import WalletAccount from './WalletAccount.vue';

import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class AccountConfirmDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: '', type: String }) readonly passphrase!: string;
  @Prop({ default: '', type: String }) readonly confirmButtonText!: string;

  @Watch('isVisible')
  private setupFormState(visibility: boolean): void {
    if (!visibility) {
      this.model = '';
    }
  }

  model = '';

  savePassword = true;
  hiddenInput = true;

  get password(): string {
    return this.passphrase || this.model;
  }

  set password(value: string) {
    this.model = value;
  }

  get passwordIcon(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get passwordInputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  get confirmText(): string {
    return this.confirmButtonText || this.t('confirmText');
  }

  get isConfirmDisabled(): boolean {
    return this.loading || !this.password;
  }

  get isInputDisabled(): boolean {
    return this.loading || !!this.passphrase;
  }

  togglePasswordVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
  }

  handleConfirm(): void {
    this.$emit('confirm', {
      password: this.password,
      save: this.savePassword,
    });
  }
}
</script>

<style lang="scss" scoped>
.confirm-dialog {
  & > * {
    margin-bottom: $basic-spacing-medium;
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
