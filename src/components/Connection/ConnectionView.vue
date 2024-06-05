<template>
  <wallet-base show-header :show-back="hasBackBtn" :title="title" @back="handleBack" v-loading="loading" title-center>
    <template v-if="logoutButtonVisibility" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleLogout">
        <s-icon name="basic-eye-24" size="28" />
      </s-button>
    </template>

    <extension-list-step
      v-if="isExtensionsList"
      :connected-wallet="connectedWallet"
      :selected-wallet="selectedWallet"
      :selected-wallet-loading="selectedWalletLoading"
      :internal-wallets="wallets.internal"
      :external-wallets="wallets.external"
      @select="handleSelectWallet"
    >
      <slot name="extension" />
    </extension-list-step>
    <account-list-step
      v-else-if="isAccountList"
      :text="accountListText"
      :is-internal="isInternal"
      :selected-wallet="selectedWallet"
      :accounts="accounts"
      @select="handleSelectAccount"
      @create="navigateToCreateAccount"
      @import="navigateToImportAccount"
    />
    <create-account-step
      v-else-if="isCreateFlow"
      :step.sync="step"
      :selected-wallet-title="selectedWalletTitle"
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
import { Mixins, Component, Prop } from 'vue-property-decorator';

import { api } from '../../api';
import { AppWallet, LoginStep } from '../../consts';
import { GDriveWallet } from '../../services/google/wallet';
import { action, getter, state } from '../../store/decorators';
import { delay } from '../../util';
import { verifyAccountJson, isInternalSource, getWallet, subscribeToWalletAccounts } from '../../util/account';
import AccountConfirmDialog from '../Account/ConfirmDialog.vue';
import LoadingMixin from '../mixins/LoadingMixin';
import NotificationMixin from '../mixins/NotificationMixin';
import WalletBase from '../WalletBase.vue';

import AccountListStep from './Step/AccountList.vue';
import CreateAccountStep from './Step/CreateAccount.vue';
import ExtensionListStep from './Step/ExtensionList.vue';
import ImportAccountStep from './Step/ImportAccount.vue';

import type { CreateAccountArgs, RestoreAccountArgs } from '../../store/account/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../types/common';
import type { Unsubcall } from '@polkadot/extension-inject/types';
import type { Wallet } from '@sora-test/wallet-connect/types';

const CHECK_EXTENSION_INTERVAL = 5_000;

const SelectAccountFlow = [LoginStep.ExtensionList, LoginStep.AccountList];
const AccountCreateFlow = [LoginStep.SeedPhrase, LoginStep.ConfirmSeedPhrase, LoginStep.CreateCredentials];
const AccountImportFlow = [LoginStep.Import, LoginStep.ImportCredentials];

const getPreviousLoginStep = (currentStep: LoginStep, isDesktop: boolean): LoginStep => {
  for (const flow of [AccountCreateFlow, AccountImportFlow]) {
    const currentStepIndex = flow.findIndex((stepValue) => stepValue === currentStep);

    if (currentStepIndex > 0) {
      return flow[currentStepIndex - 1];
    }
  }

  if (isDesktop) {
    return LoginStep.AccountList;
  } else {
    return SelectAccountFlow.includes(currentStep) ? LoginStep.ExtensionList : LoginStep.AccountList;
  }
};

@Component({
  components: {
    WalletBase,
    AccountConfirmDialog,
    AccountListStep,
    CreateAccountStep,
    ExtensionListStep,
    ImportAccountStep,
  },
})
export default class ConnectionView extends Mixins(NotificationMixin, LoadingMixin) {
  @Prop({ default: () => {}, type: Function }) private readonly closeView!: () => void;

  @Prop({ default: () => {}, type: Function }) private readonly loginAccount!: (
    account: PolkadotJsAccount
  ) => Promise<void>;

  @Prop({ default: () => {}, type: Function }) private readonly logoutAccount!: () => Promise<void>;
  @Prop({ default: () => {}, type: Function }) private readonly createAccount!: (
    data: CreateAccountArgs
  ) => Promise<KeyringPair$Json>;

  @Prop({ default: () => {}, type: Function }) private readonly restoreAccount!: (
    data: RestoreAccountArgs
  ) => Promise<void>;

  @Prop({ default: '', type: String }) public readonly connectedWallet!: AppWallet;

  @Prop({ default: false, type: Boolean }) public readonly isLoggedIn!: boolean;

  @state.account.isDesktop private isDesktop!: boolean;
  @state.account.availableWallets private availableWallets!: Array<Wallet>;
  @getter.account.wallets public wallets!: { internal: Wallet[]; external: Wallet[] };
  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;
  @action.account.setAccountPassphrase private setAccountPassphrase!: (opts: {
    address: string;
    password: string;
  }) => void;

  step: LoginStep = LoginStep.AccountList;
  accountLoginVisibility = false;
  accountLoginData: Nullable<PolkadotJsAccount> = null;

  selectedWallet: Nullable<AppWallet> = null;
  selectedWalletLoading = false;
  walletAvailabilityTimer: Nullable<NodeJS.Timeout> = null;

  accounts: Array<PolkadotJsAccount> = [];
  accountsSubscription: Nullable<VoidFunction> = null;

  setWalletAccountsSubscription(subscription: Nullable<Unsubcall>): void {
    this.accountsSubscription = subscription;
  }

  resetWalletAccountsSubscription(): void {
    this.accountsSubscription?.();
    this.accountsSubscription = null;
  }

  created(): void {
    this.resetStep();
  }

  /** Google or Desktop */
  get isInternal(): boolean {
    return this.selectedWallet !== null && isInternalSource(this.selectedWallet);
  }

  get selectedWalletTitle(): string {
    if (!this.selectedWallet) return '';

    const wallet = this.availableWallets.find((wallet) => wallet.extensionName === this.selectedWallet);

    return wallet ? wallet.title : this.selectedWallet;
  }

  get title(): string {
    if (this.isAccountList && this.selectedWalletTitle) {
      return this.t('connection.internalTitle', { wallet: this.selectedWalletTitle });
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
      return this.t('connection.title');
    }
  }

  get hasAccounts(): boolean {
    return !!this.accounts.length;
  }

  get accountListText(): string {
    if (this.isInternal) return this.t('connection.internalText', { wallet: this.selectedWalletTitle });

    return this.hasAccounts ? this.t('connection.selectAccount') : this.t('desktop.welcome.text');
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

  get isExtensionsList(): boolean {
    return this.step === LoginStep.ExtensionList;
  }

  get prevStep(): LoginStep {
    return getPreviousLoginStep(this.step, this.isDesktop);
  }

  get hasPrevStep(): boolean {
    return this.step !== this.prevStep;
  }

  get hasBackBtn(): boolean {
    return this.hasPrevStep || (this.isLoggedIn && !this.isDesktop);
  }

  public navigateToCreateAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  public navigateToImportAccount(): void {
    this.step = LoginStep.Import;
  }

  private navigateToAccountList(): void {
    this.step = LoginStep.AccountList;
  }

  public async handleAccountImport(data: RestoreAccountArgs): Promise<void> {
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

  public async handleAccountCreate(data: CreateAccountArgs): Promise<void> {
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

  public async handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): Promise<void> {
    if (isConnected) {
      this.closeView();
    } else if (this.isInternal && !this.isDesktop) {
      this.accountLoginData = account;
      this.accountLoginVisibility = true;
    } else {
      await this.withLoading(async () => {
        await this.withAppAlert(async () => {
          await this.loginAccount(account);
        });
      });
    }
  }

  public async handleSelectWallet(wallet: Wallet): Promise<void> {
    if (!wallet.installed) return;

    await this.withAppAlert(async () => {
      await this.selectWallet(wallet.extensionName as AppWallet);

      this.navigateToAccountList();
    });
  }

  private setSelectedWallet(wallet: Nullable<AppWallet> = null): void {
    this.selectedWallet = wallet;
  }

  private setSelectedWalletLoading(flag: boolean): void {
    this.selectedWalletLoading = flag;
  }

  private async subscribeToWalletAccounts(): Promise<void> {
    if (!this.selectedWallet) return;

    this.accountsSubscription = await subscribeToWalletAccounts(api, this.selectedWallet, (accounts) => {
      this.accounts = accounts;
    });
  }

  private resetWalletAvailabilitySubscription(): void {
    if (this.walletAvailabilityTimer) {
      clearInterval(this.walletAvailabilityTimer);
      this.walletAvailabilityTimer = null;
    }
    this.accounts = [];
  }

  private async subscribeOnWalletAvailability(): Promise<void> {
    const check = async () => await this.checkSelectedWallet();

    await check();

    this.walletAvailabilityTimer = setInterval(check, CHECK_EXTENSION_INTERVAL);
  }

  private async checkSelectedWallet(): Promise<void> {
    try {
      if (this.selectedWallet) {
        await getWallet(this.selectedWallet);
      }
    } catch (error) {
      console.error(error);
      this.resetSelectedWallet();
      await this.logoutAccount();
    }
  }

  private async selectWallet(wallet: AppWallet): Promise<void> {
    try {
      this.resetWalletAccountsSubscription();
      this.setSelectedWallet(wallet);
      this.setSelectedWalletLoading(true);

      await this.subscribeOnWalletAvailability();

      this.setSelectedWalletLoading(false);

      await this.subscribeToWalletAccounts();
    } catch (error) {
      this.resetSelectedWallet();
      throw error;
    }
  }

  private resetSelectedWallet(): void {
    this.resetWalletAvailabilitySubscription();
    this.resetWalletAccountsSubscription();
    this.setSelectedWallet();
    this.setSelectedWalletLoading(false);
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

  public async handleAccountLogin(password: string) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution, 250 - button transition
      await this.$nextTick();
      await delay(250);

      await this.withAppNotification(async () => {
        const { address, meta } = await this.loadAccountJson(password);

        await this.loginAccount({
          address,
          name: (meta.name as string) || '',
          source: this.selectedWallet as AppWallet,
        });

        if (this.isSignTxDialogDisabled) {
          this.setAccountPassphrase({ address, password });
        }

        this.accountLoginVisibility = false;
        this.accountLoginData = null;
      });
    });
  }

  public handleBack(): void {
    if (this.step === this.prevStep) {
      this.closeView();
    } else {
      this.step = this.prevStep;
    }
  }

  public handleLogout(): void {
    this.resetStep();
    this.logoutAccount();
  }

  private resetStep(): void {
    this.step = this.isDesktop ? LoginStep.AccountList : LoginStep.ExtensionList;
  }

  beforeDestroy(): void {
    this.resetSelectedWallet();
  }
}
</script>
