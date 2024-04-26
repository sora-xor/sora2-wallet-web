<template>
  <dialog-base
    :title="t('accountSettings.title')"
    :visible.sync="isVisible"
    class="account-settings-dialog"
    append-to-body
  >
    <div class="account-settings">
      <s-card shadow="always" size="medium" border-radius="mini" pressed>
        <div class="account-settings-option">
          <account-confirmation-option>
            <span class="account-settings-option-description">
              {{ t('accountSettings.confirmation.description') }}
            </span>
          </account-confirmation-option>
        </div>
      </s-card>

      <s-card shadow="always" size="medium" border-radius="mini" pressed>
        <div class="account-settings-option">
          <div v-if="isExternal" class="google-badge">
            <img :src="GoogleLogo" alt="google logo" />
            <span>{{ t('accountSettings.googleOnly') }}</span>
          </div>

          <account-signature-option :disabled="isExternal">
            <span class="account-settings-option-description">
              {{ t('accountSettings.signature.description') }}
            </span>
          </account-signature-option>

          <s-button
            v-if="!isExternal && !passphrase && isSignTxDialogDisabled"
            type="primary"
            class="account-settings-button"
            @click="openConfirmDialog"
          >
            {{ t('accountSettings.enterPassword') }}
          </s-button>
        </div>
      </s-card>
    </div>

    <account-confirm-dialog
      :visible.sync="accountConfirmVisibility"
      :loading="loading"
      :passphrase="passphrase"
      @confirm="saveAccountPassphrase"
    />
  </dialog-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import GoogleLogo from '../../assets/img/GoogleLogo.svg';
import { action, getter, state } from '../../store/decorators';
import { delay } from '../../util';
import DialogBase from '../DialogBase.vue';
import DialogMixin from '../mixins/DialogMixin';
import LoadingMixin from '../mixins/LoadingMixin';
import NotificationMixin from '../mixins/NotificationMixin';

import AccountConfirmDialog from './ConfirmDialog.vue';
import AccountConfirmationOption from './Settings/ConfirmationOption.vue';
import AccountSignatureOption from './Settings/SignatureOption.vue';

@Component({
  components: {
    DialogBase,
    AccountConfirmDialog,
    AccountConfirmationOption,
    AccountSignatureOption,
  },
})
export default class AccountSettingsDialog extends Mixins(DialogMixin, LoadingMixin, NotificationMixin) {
  @getter.account.passphrase passphrase!: Nullable<string>;

  @state.account.isExternal isExternal!: boolean;
  @state.transactions.isSignTxDialogDisabled isSignTxDialogDisabled!: boolean;

  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => Promise<void>;
  @action.account.unlockAccountPair private unlockAccountPair!: (passphrase: string) => void;
  @action.account.lockAccountPair private lockAccountPair!: FnWithoutArgs;

  readonly GoogleLogo = GoogleLogo;

  accountConfirmVisibility = false;

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
.account-settings {
  display: flex;
  flex-flow: column nowrap;
  gap: $basic-spacing-big;

  &-button {
    width: 100%;
    margin-top: $basic-spacing;
  }
}

.account-settings-option {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: $basic-spacing;

  &-description {
    font-size: var(--s-font-size-extra-small);
    font-weight: 300;
  }
}

$logo-size: 12px;

.google-badge {
  display: flex;
  align-items: center;
  gap: $basic-spacing-tiny;
  padding: $basic-spacing-tiny $basic-spacing;
  background: var(--s-color-base-on-accent);
  border-radius: var(--s-border-radius-mini);
  box-shadow: var(--s-shadow-tooltip);

  & > img {
    width: $logo-size;
    height: $logo-size;
  }

  & > span {
    font-size: var(--s-font-size-mini);
    font-weight: 600;
    text-transform: uppercase;
  }
}

.google-badge + .settings-option {
  margin-top: $basic-spacing;
}
</style>
