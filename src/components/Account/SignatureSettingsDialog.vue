<template>
  <dialog-base
    :title="t('accountSettings.title')"
    :visible.sync="isVisible"
    class="account-signature-settings-dialog"
    append-to-body
  >
    <div class="account-signature-settings">
      <s-card shadow="always" size="medium" border-radius="mini" pressed>
        <div class="account-signature-option">
          <label class="account-signature-option-title">
            <s-switch v-model="confirmModel" />
            <span>{{ t('accountSettings.confirmation.title') }}</span>
          </label>
          <span class="account-signature-option-description">
            {{ t('accountSettings.confirmation.description') }}
          </span>
        </div>
      </s-card>

      <s-card shadow="always" size="medium" border-radius="mini" pressed>
        <div class="account-signature-option">
          <account-password-timeout>
            <span class="account-signature-option-description">
              {{ t('accountSettings.signature.description') }}
            </span>
          </account-password-timeout>

          <s-button
            v-if="!passphrase && isSignTxDialogDisabled"
            type="primary"
            class="account-signature-settings-button"
            @click="openConfirmDialog"
          >
            {{ t('accountSettings.enterPassword') }}
          </s-button>
        </div>
      </s-card>
    </div>

    <account-confirm-dialog
      :visible.sync="accountConfirmVisibility"
      :account="account"
      :loading="loading"
      :passphrase="passphrase"
      @confirm="saveAccountPassphrase"
    />
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { action, getter, state, mutation } from '../../store/decorators';
import { delay } from '../../util';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import NotificationMixin from '../mixins/NotificationMixin';

import AccountConfirmDialog from './ConfirmDialog.vue';
import AccountPasswordTimeout from './PasswordTimeout.vue';

import type { PolkadotJsAccount } from '../../types/common';

@Component({
  components: {
    DialogBase,
    AccountConfirmDialog,
    AccountPasswordTimeout,
  },
})
export default class AccountSignatureSettingsDialog extends Mixins(DialogMixin, LoadingMixin, NotificationMixin) {
  @getter.account.account account!: PolkadotJsAccount;
  @getter.account.passphrase passphrase!: Nullable<string>;

  @state.account.isExternal isExternal!: boolean;
  @state.transactions.isSignTxDialogDisabled isSignTxDialogDisabled!: boolean;

  @state.transactions.isConfirmTxDialogEnabled private isConfirmTxDialogEnabled!: boolean;
  @mutation.transactions.setConfirmTxDialogEnabled private setConfirmTxDialogEnabled!: (flag: boolean) => void;

  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => Promise<void>;
  @action.account.unlockAccountPair private unlockAccountPair!: (passphrase: string) => void;
  @action.account.lockAccountPair private lockAccountPair!: FnWithoutArgs;

  accountConfirmVisibility = false;

  get confirmModel(): boolean {
    return this.isConfirmTxDialogEnabled;
  }

  set confirmModel(value: boolean) {
    this.setConfirmTxDialogEnabled(value);
  }

  openConfirmDialog(): void {
    this.accountConfirmVisibility = true;
  }

  async saveAccountPassphrase(password: string): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);
      // unlock pair to check password
      await this.withAppNotification(async () => {
        this.unlockAccountPair(password);
        this.setAccountPassphrase(password);
        this.accountConfirmVisibility = false;
      });
      // lock pair after check
      this.lockAccountPair();
    });
  }
}
</script>

<style lang="scss" scoped>
.account-signature-settings {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-big;

  &-button {
    width: 100%;
    margin-top: $basic-spacing;
  }
}
.account-signature-option {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing;
  font-weight: 300;

  &-title {
    display: flex;
    gap: $basic-spacing-small;
    font-size: var(--s-font-size-medium);
    cursor: pointer;
  }

  &-description {
    font-size: var(--s-font-size-extra-small);
  }
}
</style>
