<template>
  <wallet-base show-header :show-back="hasBackBtn" :title="title" @back="handleBack">
    <template v-if="logoutButtonVisibility" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleLogout">
        <s-icon name="basic-eye-24" size="28" />
      </s-button>
    </template>

    <account-list-step
      v-if="isAccountList"
      :text="accountListText"
      @select="handleSelectAccount"
      @create="navigateToCreateAccount"
      @import="navigateToImportAccount"
    />
    <create-account-step
      v-else-if="isCreateFlow"
      :step.sync="step"
      :loading="loading"
      :create-account="handleAccountCreate"
    />
    <import-account-step
      v-else-if="isImportFlow"
      :step.sync="step"
      :loading="loading"
      :create-account="handleAccountCreate"
      :restore-account="handleAccountImport"
      :json-only="!isDesktop"
    />

    <account-confirm-dialog
      with-timeout
      :visible.sync="accountLoginVisibility"
      :account="accountLoginData"
      :loading="loading"
      @confirm="handleAccountLogin"
    />
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import { AppWallet, RouteNames, LoginStep, AccountImportFlow, AccountCreateFlow } from '../../../consts';
import { GDriveWallet } from '../../../services/google/wallet';
import { action, mutation, getter, state } from '../../../store/decorators';
import { delay, getPreviousLoginStep } from '../../../util';
import { verifyAccountJson } from '../../../util/account';
import AccountConfirmDialog from '../../Account/ConfirmDialog.vue';
import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';
import WalletBase from '../../WalletBase.vue';
import AccountListStep from '../Step/AccountList.vue';
import CreateAccountStep from '../Step/CreateAccount.vue';
import ImportAccountStep from '../Step/ImportAccount.vue';

import type { CreateAccountArgs, RestoreAccountArgs } from '../../../store/account/types';
import type { Route } from '../../../store/router/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';

@Component({
  components: {
    WalletBase,
    CreateAccountStep,
    ImportAccountStep,
    AccountListStep,
    AccountConfirmDialog,
  },
})
export default class InternalConnection extends Mixins(NotificationMixin, LoadingMixin) {
  @mutation.router.navigate private navigate!: (options: Route) => void;

  @action.account.loginAccount private loginAccount!: (account: PolkadotJsAccount) => Promise<void>;
  @action.account.logout private logout!: AsyncFnWithoutArgs;
  @action.account.createAccount private createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;
  @action.account.restoreAccountFromJson private restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;
  @action.account.resetSelectedWallet private resetSelectedWallet!: FnWithoutArgs;
  @action.account.setAccountPassphrase private setAccountPassphrase!: (passphrase: string) => void;

  @getter.account.isLoggedIn private isLoggedIn!: boolean;
  @getter.account.selectedWalletTitle private selectedWalletTitle!: string;

  @state.account.isDesktop private isDesktop!: boolean;
  @state.account.polkadotJsAccounts private polkadotJsAccounts!: Array<PolkadotJsAccount>;
  @state.account.selectedWallet private selectedWallet!: AppWallet;
  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;

  step: LoginStep = LoginStep.AccountList;
  accountLoginVisibility = false;
  accountLoginData: Nullable<PolkadotJsAccount> = null;

  get title(): string {
    if (this.isAccountList) {
      if (this.selectedWalletTitle) return this.t('connection.internalTitle', { wallet: this.selectedWalletTitle });
      return this.t('connection.title');
    } else if (this.isCreateFlow) {
      switch (this.step) {
        case LoginStep.SeedPhrase:
          return this.t('desktop.heading.seedPhraseTitle');
        case LoginStep.ConfirmSeedPhrase:
          return this.t('desktop.heading.confirmSeedTitle');
        case LoginStep.CreateCredentials:
          return this.t('desktop.heading.accountDetailsTitle');
        default:
          return '';
      }
    } else if (this.isImportFlow) {
      switch (this.step) {
        case LoginStep.Import:
          return this.t('desktop.heading.importTitle');
        case LoginStep.ImportCredentials:
          return this.t('desktop.heading.accountDetailsTitle');
        default:
          return '';
      }
    } else {
      return '';
    }
  }

  get accountListText(): string {
    if (this.selectedWalletTitle) return this.t('connection.internalText', { wallet: this.selectedWalletTitle });

    return this.polkadotJsAccounts.length ? this.t('connection.selectAccount') : this.t('desktop.welcome.text');
  }

  get logoutButtonVisibility(): boolean {
    return this.isLoggedIn && !this.isCreateFlow && !this.isImportFlow;
  }

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportFlow.includes(this.step);
  }

  get isAccountList(): boolean {
    return this.step === LoginStep.AccountList;
  }

  get prevStep(): LoginStep {
    return getPreviousLoginStep(this.step);
  }

  get hasPrevStep(): boolean {
    if (!this.isDesktop) return true;
    return this.step !== this.prevStep;
  }

  get hasBackBtn(): boolean {
    return this.hasPrevStep || (this.isLoggedIn && !this.isDesktop);
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

  async handleAccountImport(data: RestoreAccountArgs): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        const { json, password } = data;
        const verified = verifyAccountJson(json, password);

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(verified, password);
        } else if (this.isDesktop) {
          await this.restoreAccount(data);
        }

        this.navigateToAccountList();
      });
    });
  }

  async handleAccountCreate(data: CreateAccountArgs): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        const accountJson = await this.createAccount({ ...data, saveAccount: this.isDesktop });

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(accountJson, data.password, data.seed);
        }

        this.navigateToAccountList();
      });
    });
  }

  async handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): Promise<void> {
    console.log(isConnected);
    if (isConnected) {
      return this.navigate({ name: RouteNames.Wallet });
    }
    if (this.isDesktop) {
      await this.withLoading(async () => {
        try {
          await this.loginAccount(account);
        } catch (error) {
          this.showAppAlert(this.t('enterAccountError'));
        }
      });
    } else {
      this.accountLoginData = account;
      this.accountLoginVisibility = true;
    }
  }

  private async loadAccountJson(password: string): Promise<KeyringPair$Json> {
    if (!this.accountLoginData || this.selectedWallet !== AppWallet.GoogleDrive) {
      throw new Error('polkadotjs.noAccount');
    }

    const json = await GDriveWallet.accounts.getAccount(this.accountLoginData.address, password);

    if (!json) throw new Error('polkadotjs.noAccount');

    await this.restoreAccount({ json, password });

    return json;
  }

  async handleAccountLogin(password: string) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        const { address, meta } = await this.loadAccountJson(password);

        await this.loginAccount({
          address,
          name: (meta.name as string) || '',
          source: this.selectedWallet,
        });

        if (this.isSignTxDialogDisabled) {
          this.setAccountPassphrase(password);
        }

        this.accountLoginVisibility = false;
        this.accountLoginData = null;
      });
    });
  }

  handleBack(): void {
    if (this.step === this.prevStep) {
      this.navigate({ name: RouteNames.WalletConnection });
    } else {
      this.step = this.prevStep;
    }
  }

  handleLogout(): void {
    this.navigate({ name: RouteNames.WalletConnection });
    this.logout();
  }

  beforeDestroy(): void {
    this.resetSelectedWallet();
  }
}
</script>
