<template>
  <wallet-base
    v-loading="loading"
    :title="t('connection.title')"
    :show-header="showHeader"
    :show-back="showBackBtn"
    @back="handleBack"
  >
    <div class="desktop-connection">
      <internal-account-list
        v-if="isAccountList"
        :text="t('connection.selectAccount')"
        @select="handleSelectAccount"
        @create="navigateToCreateAccount"
        @import="navigateToImportAccount"
      />
      <create-account v-else-if="isCreateFlow" :step.sync="step" :create-account="handleAccountCreate" />
      <import-account v-else-if="isImportFlow" :step.sync="step" />
      <welcome-page v-else @create="navigateToCreateAccount" @import="navigateToImportAccount" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';

import WalletBase from '../../WalletBase.vue';
import WelcomePage from '../Desktop/WelcomePage.vue';
import CreateAccount from '../Internal/CreateAccount.vue';
import InternalAccountList from '../Internal/AccountList.vue';
import ImportAccount from '../Internal/ImportAccount.vue';

import { LoginStep, AccountImportFlow, AccountCreateFlow } from '../../../consts';
import { getPreviousLoginStep } from '../../../util';
import { state, action } from '../../../store/decorators';

import type { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';
import type { CreateAccountArgs } from '../../../store/account/types';

@Component({
  components: { WalletBase, WelcomePage, CreateAccount, ImportAccount, InternalAccountList },
})
export default class DesktopConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @action.account.loginAccount loginAccount!: (account: PolkadotJsAccount) => Promise<void>;

  @action.account.createAccount createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportFlow.includes(this.step);
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

  async handleAccountCreate(data: CreateAccountArgs) {
    await this.createAccount({ ...data, saveAccount: true });
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
