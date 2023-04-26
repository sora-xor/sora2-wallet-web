<template>
  <dialog-base :title="t('desktop.dialog.confirmTitle')" :visible.sync="isVisible" class="confirm-dialog">
    <s-form class="confirm-dialog__form" @submit.native.prevent="handleConfirm">
      <wallet-account :polkadot-account="account" />
      <s-input
        v-if="!passphrase"
        :type="passwordInputType"
        :placeholder="t('desktop.password.placeholder')"
        :disabled="loading"
        v-model="password"
      >
        <s-icon
          :name="passwordIcon"
          class="eye-icon"
          size="18"
          slot="suffix"
          @click.native="togglePasswordVisibility"
        />
      </s-input>
      <div v-if="savePassphrase" class="confirm-dialog__save-password">
        <s-switch v-model="savePassword" />
        <span v-if="!passphrase">{{ t('desktop.dialog.savePasswordText') }}</span>
        <span v-else>{{ t('desktop.dialog.extendPasswordText') }}</span>
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
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import DialogBase from '../DialogBase.vue';
import WalletAccount from './WalletAccount.vue';

import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

import { ObjectInit } from '../../consts';
import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class AccountConfirmDialog extends Mixins(DialogMixin, TranslationMixin) {
  @Prop({ default: ObjectInit, type: Object }) readonly account!: PolkadotJsAccount;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: false, type: Boolean }) readonly savePassphrase!: boolean;
  @Prop({ default: '', type: String }) readonly passphrase!: string;
  @Prop({ default: '', type: String }) readonly confirmButtonText!: string;

  @Watch('isVisible')
  private setupFormState(visibility: boolean): void {
    if (!visibility) {
      this.model = '';
      this.hiddenInput = true;
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

  togglePasswordVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
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
