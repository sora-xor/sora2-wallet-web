<template>
  <dialog-base title="Transaction settings" :visible.sync="isVisible" class="account-signature-settings-dialog">
    <div class="account-signature-settings">
      <div class="account-signature-option">
        <label class="account-signature-option-label">
          <s-switch v-model="confirmModel" />
          <span>Confirm transaction dialog</span>
        </label>
        <span class="account-signature-option-description"> Confirm transaction dialog description </span>
      </div>

      <div class="account-signature-option">
        <label class="account-signature-option-label">
          <s-switch v-model="signatureModel" />
          <span>Sign transaction dialog</span>
        </label>
        <span class="account-signature-option-description"> Sign transaction dialog description </span>
      </div>

      <div class="account-signature-option">
        <label class="account-signature-option-label"> </label>
        <span class="account-signature-option-description"> Passphrase timeout description </span>
      </div>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { state, mutation } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component({
  components: {
    DialogBase,
  },
})
export default class AccountSignatureSettingsDialog extends Mixins(DialogMixin, TranslationMixin) {
  @state.transactions.isConfirmTxDialogEnabled private isConfirmTxDialogEnabled!: boolean;
  @state.transactions.isSignTxDialogEnabled private isSignTxDialogEnabled!: boolean;
  @state.account.passhraseTimeout passhraseTimeout!: number;

  @mutation.transactions.setConfirmTxDialogEnabled private setConfirmTxDialogEnabled!: (flag: boolean) => void;
  @mutation.transactions.setSignTxDialogEnabled private setSignTxDialogEnabled!: (flag: boolean) => void;

  get confirmModel(): boolean {
    return this.isConfirmTxDialogEnabled;
  }

  set confirmModel(value: boolean) {
    this.setConfirmTxDialogEnabled(value);
  }

  get signatureModel(): boolean {
    return this.isSignTxDialogEnabled;
  }

  set signatureModel(value: boolean) {
    this.setSignTxDialogEnabled(value);
  }
}
</script>

<style lang="scss" scoped>
.account-signature-settings {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-medium;

  &__button {
    width: 100%;
  }
}
</style>
