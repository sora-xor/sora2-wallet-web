<template>
  <dialog-base :title="t('desktop.dialog.confirmTitle')" :visible.sync="isVisible">
    <div class="confirm-dialog">
      <wallet-account class="confirm-dialog__account" />
      <s-input
        :type="inputType"
        :placeholder="t('desktop.password.placeholder')"
        v-model="accountPassword"
        :disabled="loading"
        class="confirm-dialog__password"
      >
        <s-icon :name="iconPasswordStyle" class="eye-icon" size="18" slot="suffix" @click.native="toggleVisibility" />
      </s-input>
      <div class="confirm-dialog__save-password">
        <s-switch v-model="savePassword" />
        <span>{{ t('desktop.dialog.savePasswordText') }}</span>
      </div>
      <s-button type="primary" class="confirm-dialog__button">{{ t('desktop.dialog.confirmButton') }} </s-button>
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

@Component({
  components: {
    DialogBase,
    WalletAccount,
  },
})
export default class ConfirmDialog extends Mixins(DialogMixin, TranslationMixin, LoadingMixin) {
  accountPassword = '';

  savePassword = false;
  hiddenInput = true;

  get iconPasswordStyle(): string {
    return this.hiddenInput ? 'basic-eye-no-24' : 'basic-filterlist-24';
  }

  get inputType(): string {
    return this.hiddenInput ? 'password' : 'text';
  }

  toggleVisibility(): void {
    this.hiddenInput = !this.hiddenInput;
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
