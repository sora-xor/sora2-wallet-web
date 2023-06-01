<template>
  <wallet-base
    v-loading="loading"
    :title="t('connection.title')"
    :show-header="showHeader"
    :show-back="showBackBtn"
    @back="handleBack"
  >
    <div class="desktop-connection">
      <account-list-step
        v-if="isAccountList"
        :text="t('connection.selectAccount')"
        @select="handleSelectAccount"
        @create="navigateToCreateAccount"
        @import="navigateToImportAccount"
      />
      <create-account-step v-else-if="isCreateFlow" :step.sync="step" :create-account="handleCreateAccount" />
      <import-account-step
        v-else-if="isImportFlow"
        :step.sync="step"
        :create-account="handleCreateAccount"
        :restore-account="handleRestoreAccount"
      />
      <welcome-page v-else @create="navigateToCreateAccount" @import="navigateToImportAccount" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import { LoginStep, AccountImportInternalFlow, AccountCreateFlow } from '../../../consts';
import { state, action } from '../../../store/decorators';
import { getPreviousLoginStep, delay } from '../../../util';
import WalletBase from '../../WalletBase.vue';
import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import WelcomePage from '../Desktop/WelcomePage.vue';
import AccountListStep from '../Step/AccountList.vue';
import CreateAccountStep from '../Step/CreateAccount.vue';
import ImportAccountStep from '../Step/ImportAccount.vue';

import type { CreateAccountArgs, RestoreAccountArgs } from '../../../store/account/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';

@Component({
  components: { WalletBase, WelcomePage, CreateAccountStep, ImportAccountStep, AccountListStep },
})
export default class DesktopConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @action.account.loginAccount private loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.createAccount private createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;
  @action.account.restoreAccountFromJson private restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportInternalFlow.includes(this.step);
  }

  get isAccountList(): boolean {
    return this.step === LoginStep.AccountList;
  }

  get showBackBtn(): boolean {
    // show back button depending on which view is rendered
    if (this.step === LoginStep.Welcome && !this.polkadotJsAccounts.length) return false;
    if (this.step === LoginStep.AccountList) return false;
    if (this.step !== LoginStep.Welcome) return true;
    if (this.isCreateFlow || this.isImportFlow) return false;
    return true;
  }

  get showHeader(): boolean {
    // show header depending on which view is rendered
    if (this.step === LoginStep.Welcome && this.polkadotJsAccounts.length) return true;
    if (this.step === LoginStep.AccountList) return true;
    return false;
  }

  navigateToCreateAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  navigateToImportAccount(): void {
    this.step = LoginStep.Import;
  }

  navigateToAccountList(): void {
    this.step = LoginStep.AccountList;
  }

  handleBack(): void {
    this.step = getPreviousLoginStep(this.step);
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.loginAccount(account);
      } catch (error) {
        this.showAppAlert(this.t('enterAccountError'));
      }
    });
  }

  async handleCreateAccount(data: CreateAccountArgs) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        await this.createAccount({ ...data, saveAccount: true });
        this.navigateToAccountList();
      });
    });
  }

  async handleRestoreAccount(data: RestoreAccountArgs) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        await this.restoreAccount(data);
        this.navigateToAccountList();
      });
    });
  }

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.polkadotJsAccounts.length) {
        this.navigateToAccountList();
      }
    });
  }
}
</script>
