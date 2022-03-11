<template>
  <wallet-base :title="t('connection.title')" :show-header="showHeader" :show-back="showBackBtn" @back="handleBack">
    <div class="desktop-connection" v-loading="loading">
      <welcome-page v-if="step === LoginStep.Welcome" @create="createAccount" @import="importAccount" />
      <create-account v-else-if="isCreateFlow" :step="step" class="login" @stepChange="setStep" />
      <import-account v-else-if="isImportFlow" :step="step" class="login" @stepChange="setStep" />
      <connected-account-list
        v-else-if="isAccountList"
        @handleSelectAccount="handleSelectAccount"
        @stepChange="setStep"
      />
    </div>
    <!-- <confirm-dialog :visible="true" /> -->
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../mixins/LoadingMixin';
import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';
import WelcomePage from './Desktop/WelcomePage.vue';
import CreateAccount from './Desktop/CreateAccount.vue';
import ImportAccount from './Desktop/ImportAccount.vue';
import { LoginStep } from '../../consts';
import { getPreviousLoginStep } from '../../util';
import { Getter, Action } from 'vuex-class';
import ConnectedAccountList from './common/ConnectedAccountList.vue';
import { PolkadotJsAccount } from '@/types/common';
import ConfirmDialog from '../ConfirmDialog.vue';

@Component({
  components: { WalletBase, WelcomePage, CreateAccount, ImportAccount, ConnectedAccountList, ConfirmDialog },
})
export default class DesktopConnection extends Mixins(TranslationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

  @Getter currentRouteParams!: any;
  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @Action importPolkadotJsDesktop!: (address: string) => Promise<void>;

  showWelcomePage = true;

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
    if (this.step === LoginStep.Welcome && !this.polkadotJsAccounts.length) return false;
    if (this.step === LoginStep.AccountList) return false;
    if (this.step !== LoginStep.Welcome) return true;
    if (this.isCreateFlow || this.isImportFlow) return false;
    return true;
  }

  get showHeader(): boolean {
    if (this.step === LoginStep.Welcome && this.polkadotJsAccounts.length) return true;
    // if (this.step === LoginStep.Welcome) return true;
    if (this.step === LoginStep.AccountList) return true;
    // if (this.polkadotJsAccounts.length > 0) return true;
    return false;
  }

  get isAccountSwitch(): boolean {
    return (this.currentRouteParams || {}).isAccountSwitch;
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
        console.log('handleSelect', account);
        await this.importPolkadotJsDesktop(account.address);
      } catch (error) {
        this.$alert(this.t((error as Error).message), this.t('errorText'));
      }
    });
  }

  async mounted(): Promise<void> {
    if (this.polkadotJsAccounts.length) {
      this.step = LoginStep.AccountList;
    } else {
      this.step = LoginStep.Welcome;
    }
    await this.withApi(async () => {
      if (this.isAccountSwitch || this.polkadotJsAccounts.length) {
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
    font-size: 24px;
  }

  &__step-count {
    color: var(--s-color-base-content-secondary);
    font-size: 14px;
  }
}
</style>
