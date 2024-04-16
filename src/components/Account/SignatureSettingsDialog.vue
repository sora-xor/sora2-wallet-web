<template>
  <dialog-base title="Transaction settings" :visible.sync="isVisible" class="account-signature-settings-dialog">
    <div class="account-signature-settings">
      <div class="account-signature-option">
        <label class="account-signature-option-label">
          <s-switch v-model="confirmModel" />
          <span>Confirmation dialog</span>
        </label>
        <span class="account-signature-option-description">
          Show a confirmation dialog with transaction details before transaction signing
        </span>
        <span v-if="confirmModel" class="account-signature-option-description info">
          You can disable this option to speed up the transaction signing process
        </span>
      </div>

      <template v-if="!isExternal">
        <div class="account-signature-option">
          <label class="account-signature-option-label">
            <s-switch v-model="signatureModel" />
            <span>Signature dialog</span>
          </label>
          <span class="account-signature-option-description">Show transaction signature dialog using password</span>
          <span v-if="signatureModel" class="account-signature-option-description info">
            You can disable this option to speed up the transaction signing process
          </span>
        </div>

        <div class="account-signature-option">
          <s-tabs v-model="passhraseTimeoutModel" type="rounded" class="passphrase-timeouts">
            <s-tab v-for="name in PassphraseTimeout" :key="name" :label="name" :name="name" />
          </s-tabs>
          <span :class="['account-signature-option-description', { warning: isUnlimitedTimeout }]">
            Your account passphrase will be stored for {{ passhraseTimeoutModel }} period. <br />
          </span>
          <span v-if="isUnlimitedTimeout" class="account-signature-option-description warning">
            Make sure that unauthorized persons do not have access to your device
          </span>
          <span v-if="isSavedAccountPassphrase" class="account-signature-option-description info">
            Your account passphrase will be reset once the period is changed.
          </span>
        </div>

        <div class="account-signature-option">
          <s-button v-if="isSavedAccountPassphrase" type="secondary" @click="resetAccountPassphrase">
            Reset passphrase
          </s-button>
          <template v-else>
            <s-button type="primary"> Enter passphrase </s-button>
            <span class="account-signature-option-description">
              You can enter your account passphrase in advance so you don't have to enter it when signing a transaction.
            </span>
          </template>
        </div>
      </template>
    </div>
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { PassphraseTimeout, PassphraseTimeoutDuration, DefaultPassphraseTimeout } from '../../consts';
import { action, getter, state, mutation } from '../../store/decorators';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import TranslationMixin from '../mixins/TranslationMixin';

@Component({
  components: {
    DialogBase,
  },
})
export default class AccountSignatureSettingsDialog extends Mixins(DialogMixin, TranslationMixin) {
  @getter.account.passphrase private passhprase!: Nullable<string>;
  @getter.account.passphraseTimeoutKey private passphraseTimeoutKey!: PassphraseTimeout;

  @state.transactions.isConfirmTxDialogEnabled private isConfirmTxDialogEnabled!: boolean;
  @state.transactions.isSignTxDialogEnabled private isSignTxDialogEnabled!: boolean;
  @state.account.isExternal isExternal!: boolean;

  @mutation.transactions.setConfirmTxDialogEnabled private setConfirmTxDialogEnabled!: (flag: boolean) => void;
  @mutation.transactions.setSignTxDialogEnabled private setSignTxDialogEnabled!: (flag: boolean) => void;
  @mutation.account.setPassphraseTimeout private setPassphraseTimeout!: (timeout: number) => void;

  @action.account.resetAccountPassphrase resetAccountPassphrase!: FnWithoutArgs;

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
    return this.passphraseTimeoutKey;
  }

  set passhraseTimeoutModel(name: PassphraseTimeout) {
    const duration = PassphraseTimeoutDuration[name] ?? DefaultPassphraseTimeout;
    this.resetAccountPassphrase();
    this.setPassphraseTimeout(duration);
  }

  get isUnlimitedTimeout(): boolean {
    return this.passhraseTimeoutModel === PassphraseTimeout.UNLIMITED;
  }

  get isSavedAccountPassphrase(): boolean {
    return !!this.passhprase;
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
    padding: 0 $basic-spacing-big;
  }
}
</style>

<style lang="scss" scoped>
.account-signature-settings {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-big;

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

    &.info {
      color: var(--s-color-status-info);
    }
    &.warning {
      color: var(--s-color-status-warning);
    }
  }
}
</style>
