<template>
  <dialog-base title="Transaction settings" :visible.sync="isVisible" class="account-signature-settings-dialog">
    <div class="account-signature-settings">
      <div class="account-signature-option">
        <label class="account-signature-option-label">
          <s-switch v-model="confirmModel" />
          <span>Confirm transaction dialog</span>
        </label>
        <span class="account-signature-option-description">Confirm transaction dialog description</span>
      </div>

      <div v-if="!isExternal" class="account-signature-option">
        <label class="account-signature-option-label">
          <s-switch v-model="signatureModel" />
          <span>Sign transaction dialog</span>
        </label>
        <span class="account-signature-option-description">Sign transaction dialog description</span>
      </div>

      <div v-if="!isExternal" class="account-signature-option">
        <s-tabs v-model="passhraseTimeoutModel" type="rounded" class="passphrase-timeouts">
          <s-tab v-for="name in PassphraseTimeout" :key="name" :label="name" :name="name" />
        </s-tabs>
        <span v-if="isUnlimitedTimeout" class="account-signature-option-description warning">Is unlimited selected</span>
        <span class="account-signature-option-description">Passphrase timeout description</span>
      </div>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../consts';
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
  @state.account.passphraseTimeout private passphraseTimeout!: number;
  @state.account.isExternal isExternal!: boolean;

  @mutation.transactions.setConfirmTxDialogEnabled private setConfirmTxDialogEnabled!: (flag: boolean) => void;
  @mutation.transactions.setSignTxDialogEnabled private setSignTxDialogEnabled!: (flag: boolean) => void;
  @mutation.account.setPassphraseTimeout private setPassphraseTimeout!: (timeout: number) => void;

  readonly PassphraseTimeout = PassphraseTimeout;

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

  get passhraseTimeoutModel(): PassphraseTimeout {
    const key = Object.keys(PassphraseTimeoutDuration).find(
      (key) => PassphraseTimeoutDuration[key] === this.passphraseTimeout
    );

    if (!key) return PassphraseTimeout.FIFTEEN_MINUTES;

    return key as PassphraseTimeout;
  }

  set passhraseTimeoutModel(name: PassphraseTimeout) {
    const duration = PassphraseTimeoutDuration[name] ?? DefaultPassphraseTimeout;
    this.setPassphraseTimeout(duration);
  }

  get isUnlimitedTimeout(): boolean {
    return this.passhraseTimeoutModel === PassphraseTimeout.UNLIMITED;
  }
}
</script>

<style lang="scss">
.passphrase-timeouts {
  .el-tabs__header {
    margin-bottom: 0;
  }

  &.s-tabs.s-rounded .el-tabs__nav-wrap .el-tabs__item {
    text-transform: initial;
  }
}
</style>

<style lang="scss" scoped>
.account-signature-settings {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-medium;

  &__button {
    width: 100%;
  }
}
.account-signature-option {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing;

  font-weight: 300;

  &-label {
    display: flex;
    gap: $basic-spacing-small;
    cursor: pointer;
    font-size: var(--s-font-size-medium);
  }

  &-description {
    font-size: var(--s-font-size-extra-small);

    &.warning {
      color: var(--s-color-status-warning);
    }
  }
}
</style>
