<template>
  <wallet-base
    v-loading="loading"
    :title="t('connection.title')"
    :show-header="showHeader"
    :show-back="showBackBtn"
    @back="handleBack"
  >
    <div class="desktop-connection">
      <welcome-page v-if="step === LoginStep.Welcome" @create="createAccount" @import="importAccount" />
      <create-account v-else-if="isCreateFlow" :step="step" class="login" @stepChange="setStep" />
      <import-account v-else-if="isImportFlow" :step="step" class="login" @stepChange="setStep" />
      <connected-account-list
        v-else-if="isAccountList"
        @handleSelectAccount="handleSelectAccount"
        @stepChange="setStep"
      />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';
import type { PolkadotJsAccount } from '../../../types/common';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import WalletBase from '../../WalletBase.vue';
import WelcomePage from '../Desktop/WelcomePage.vue';
import CreateAccount from '../Desktop/CreateAccount.vue';
import ConnectedAccountList from '../Desktop/ConnectedAccountList.vue';
import ImportAccount from '../Desktop/ImportAccount.vue';

import { LoginStep } from '../../../consts';
import { getPreviousLoginStep } from '../../../util';
import { state, action } from '../../../store/decorators';

@Component({
  components: { WalletBase, WelcomePage, CreateAccount, ImportAccount, ConnectedAccountList },
})
export default class DesktopConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

  @state.account.polkadotJsAccounts polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @action.account.importPolkadotJsDesktop importPolkadotJsDesktop!: (account: PolkadotJsAccount) => Promise<void>;

  get isCreateFlow(): boolean {
    return [LoginStep.SeedPhrase, LoginStep.ConfirmSeedPhrase, LoginStep.CreateCredentials].includes(this.step);
  }

  get isImportFlow(): boolean {
    return [LoginStep.Import, LoginStep.ImportCredentials].includes(this.step);
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

  createAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  importAccount(): void {
    this.step = LoginStep.Import;
  }

  setStep(step: LoginStep): void {
    this.step = step;
  }

  navigateToAccountList(): void {
    this.step = LoginStep.AccountList;
  }

  handleBack(): void {
    const step = getPreviousLoginStep(this.step);
    this.step = step;
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJsDesktop(account);
      } catch (error) {
        this.showAppAlert(this.t('enterAccountError'));
      }
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

<style lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &-btn {
    margin: 8px 0 !important;
    width: 100%;
  }

  &__title {
    font-weight: 400;
    font-size: var(--s-font-size-large);
  }

  &__step-count {
    color: var(--s-color-base-content-secondary);
    font-size: 14px;
  }

  .el-textarea {
    &__inner {
      resize: none !important;
    }
  }
}
</style>
