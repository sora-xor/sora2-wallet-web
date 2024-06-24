<template>
  <wallet-base
    show-header
    title-center
    :show-back="hasBackBtn"
    :title="viewTitle"
    v-bind="$attrs"
    @back="handleBack"
    @close="closeView"
  >
    <template v-if="logoutButtonVisibility" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleAccountLogout">
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
      @select="handleWalletSelect"
    >
      <slot name="extension" />
    </extension-list-step>
    <account-list-step
      v-else-if="isAccountList"
      :chain-api="chainApi"
      :text="accountListText"
      :is-internal="isInternal"
      :connected-wallet="connectedWallet"
      :connected-account="connectedAccount"
      :selected-wallet="selectedWallet"
      :accounts="accounts"
      :rename-account="renameAccount"
      :export-account="handleAccountExport"
      :delete-account="handleAccountDelete"
      :logout-account="handleAccountLogout"
      @select="handleAccountSelect"
      @create="navigateToCreateAccount"
      @import="navigateToImportAccount"
    />
    <create-account-step
      v-else-if="isCreateFlow"
      :step.sync="step"
      :chain-api="chainApi"
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

import { AppWallet, LoginStep } from '../../consts';
import { GDriveWallet } from '../../services/google/wallet';
import { addWcWalletLocally } from '../../services/walletconnect';
import { action, state } from '../../store/decorators';
import { delay } from '../../util';
import {
  verifyAccountJson,
  isInternalSource,
  getWallet,
  isInternalWallet,
  subscribeToWalletAccounts,
  exportAccount,
  deleteAccount,
  createAccount,
  restoreAccount,
} from '../../util/account';
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
import type { WithKeyring } from '@sora-substrate/util';
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
  @Prop({ required: true, type: Object }) public readonly chainApi!: WithKeyring;

  @Prop({ default: () => null, type: Object }) private readonly account!: Nullable<PolkadotJsAccount>;

  @Prop({ default: () => {}, type: Function }) private readonly loginAccount!: (
    account: PolkadotJsAccount
  ) => Promise<void>;

  @Prop({ default: () => {}, type: Function }) public readonly logoutAccount!: () => Promise<void>;

  @Prop({ default: () => {}, type: Function }) public readonly renameAccount!: (data: {
    address: string;
    name: string;
  }) => Promise<void>;

  @Prop({ default: () => {}, type: Function }) private readonly closeView!: () => void;

  @state.account.isDesktop private isDesktop!: boolean;
  @state.account.availableWallets private availableWallets!: Wallet[];
  @state.transactions.isSignTxDialogDisabled private isSignTxDialogDisabled!: boolean;
  @action.account.updateAvailableWallets private updateAvailableWallets!: () => void;
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

  wcName = '';

  resetWalletAccountsSubscription(): void {
    this.accountsSubscription?.();
    this.accountsSubscription = null;
  }

  created(): void {
    this.createWcWallet();

    this.resetStep();

    if (this.isDesktop) {
      this.withApi(() => {
        this.subscribeToWalletAccounts();
      });
    }
  }

  private createWcWallet(): void {
    this.withApi(() => {
      this.wcName = addWcWalletLocally(this.chainGenesisHash);
      this.updateAvailableWallets();
    });
  }

  beforeDestroy(): void {
    this.resetSelectedWallet();
  }

  get chainGenesisHash(): string {
    return this.chainApi.api.genesisHash.toString();
  }

  get connectedAccount(): string {
    return this.account?.address ?? '';
  }

  get connectedWallet(): AppWallet {
    return (this.account?.source ?? '') as AppWallet;
  }

  /** Google or Desktop */
  get isInternal(): boolean {
    return this.isDesktop || (!!this.selectedWallet && isInternalSource(this.selectedWallet));
  }

  get wallets() {
    const wallets: { internal: Wallet[]; external: Wallet[] } = {
      internal: [], // integrations, app signing
      external: [], // extensions
    };
    const wcPrefix = this.wcName.split(':')[0];

    return this.availableWallets.reduce((buffer, wallet) => {
      const name = wallet.extensionName;

      // show walletconnect only for this connection
      if (wcPrefix && name.startsWith(wcPrefix) && name !== this.wcName) {
        return buffer;
      }

      if (isInternalWallet(wallet)) {
        buffer.internal.push(wallet);
      } else {
        buffer.external.push(wallet);
      }
      return buffer;
    }, wallets);
  }

  get selectedWalletTitle(): string {
    if (!this.selectedWallet) return '';

    const wallet = this.availableWallets.find((wallet) => wallet.extensionName === this.selectedWallet);

    return wallet ? wallet.title : this.selectedWallet;
  }

  get viewTitle(): string {
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
      return this.t('account.accountTitle');
    }
  }

  get hasAccounts(): boolean {
    return !!this.accounts.length;
  }

  get accountListText(): string {
    if (this.isInternal) return this.t('connection.internalText', { wallet: this.selectedWalletTitle });

    return this.hasAccounts ? this.t('connection.selectAccount') : this.t('desktop.welcome.text');
  }

  get isLoggedIn(): boolean {
    return !!this.connectedAccount;
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
        const verified = verifyAccountJson(this.chainApi, json, password);

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(verified, password);
        } else if (this.isDesktop) {
          this.handleAccountRestore(data);
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
        const accountJson = createAccount(this.chainApi, { ...data, saveAccount: this.isDesktop });

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(accountJson, data.password, data.seed);
        }

        this.navigateToAccountList();
      });
    });
  }

  public async handleAccountSelect(account: PolkadotJsAccount, isConnected: boolean): Promise<void> {
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

  public async handleWalletSelect(wallet: Wallet): Promise<void> {
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
    this.accountsSubscription = await subscribeToWalletAccounts(this.chainApi, this.selectedWallet, (accounts) => {
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
    this.walletAvailabilityTimer = setInterval(() => this.checkSelectedWallet(), CHECK_EXTENSION_INTERVAL);
  }

  private async checkSelectedWallet(): Promise<void> {
    try {
      if (this.selectedWallet) {
        await getWallet(this.selectedWallet);
      }
    } catch (error) {
      console.error(error);
      this.resetSelectedWallet();
      this.handleAccountLogout();
    }
  }

  private async selectWallet(wallet: AppWallet): Promise<void> {
    try {
      this.resetWalletAccountsSubscription();
      this.setSelectedWallet(wallet);
      this.setSelectedWalletLoading(true);

      await getWallet(wallet);
      await this.subscribeOnWalletAvailability();

      this.setSelectedWalletLoading(false);

      await this.subscribeToWalletAccounts();
    } catch (error) {
      console.error(error);
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

    this.handleAccountRestore({ json, password });

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

  public handleAccountExport(data: { address: string; password: string }): void {
    exportAccount(this.chainApi, data);
  }

  public handleAccountDelete(address: string): void {
    deleteAccount(this.chainApi, address);
  }

  public handleAccountRestore(data: RestoreAccountArgs): void {
    restoreAccount(this.chainApi, data);
  }

  public handleBack(): void {
    if (this.step === this.prevStep) {
      this.closeView();
    } else {
      this.step = this.prevStep;

      if (this.isExtensionsList) {
        this.resetSelectedWallet();
      }
    }
  }

  public handleAccountLogout(): void {
    this.resetStep();
    this.logoutAccount();
  }

  private resetStep(): void {
    this.step = this.isDesktop ? LoginStep.AccountList : LoginStep.ExtensionList;
  }
}
</script>
