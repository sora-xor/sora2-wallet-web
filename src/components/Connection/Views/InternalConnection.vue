<template>
  <wallet-base :title="title" :show-header="showHeader" show-back @back="handleBack">
    <template v-if="logoutButtonVisibility" #actions>
      <s-button type="action" :tooltip="t('logoutText')" @click="handleLogout">
        <s-icon name="basic-eye-24" size="28" />
      </s-button>
    </template>

    <account-list-step
      v-if="isAccountList"
      :text="text"
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
      :restore-account="handleAccountImport"
      json-only
    />

    <account-confirm-dialog
      :visible.sync="accountLoginVisibility"
      :account="accountLoginData"
      :loading="loading"
      @confirm="handleAccountLogin"
    />
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';

import WalletBase from '../../WalletBase.vue';
import CreateAccountStep from '../Step/CreateAccount.vue';
import ImportAccountStep from '../Step/ImportAccount.vue';
import AccountListStep from '../Step/AccountList.vue';
import AccountConfirmDialog from '../../Account/ConfirmDialog.vue';

import { action, mutation, getter, state } from '../../../store/decorators';
import { AppWallet, RouteNames, LoginStep, AccountImportInternalFlow, AccountCreateFlow } from '../../../consts';
import { delay, getPreviousLoginStep } from '../../../util';
import { GDriveWallet } from '../../../services/google/wallet';

import type { Route } from '../../../store/router/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';
import type { CreateAccountArgs, RestoreAccountArgs } from '../../../store/account/types';

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

  @getter.account.isLoggedIn isLoggedIn!: boolean;
  @getter.account.selectedWalletTitle private selectedWalletTitle!: string;

  @state.account.selectedWallet private selectedWallet!: AppWallet;

  step: LoginStep = LoginStep.AccountList;

  accountLoginVisibility = false;
  accountLoginData: Nullable<PolkadotJsAccount> = null;

  get title(): string {
    return this.t('connection.internalTitle', { wallet: this.selectedWalletTitle });
  }

  get text(): string {
    return this.t('connection.internalText', { wallet: this.selectedWalletTitle });
  }

  get logoutButtonVisibility(): boolean {
    return this.isLoggedIn && !this.isCreateFlow && !this.isImportFlow;
  }

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportInternalFlow.includes(this.step);
  }

  get isAccountList(): boolean {
    return this.step === LoginStep.AccountList;
  }

  get showHeader(): boolean {
    return this.isAccountList;
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
      await this.withAppNotification(async () => {
        const { json } = data;

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(json);
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
        const accountJson = await this.createAccount(data);

        if (this.selectedWallet === AppWallet.GoogleDrive) {
          await GDriveWallet.accounts.add(accountJson);
        }

        this.navigateToAccountList();
      });
    });
  }

  handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): void {
    if (isConnected) {
      this.navigate({ name: RouteNames.Wallet });
    } else {
      this.accountLoginData = account;
      this.accountLoginVisibility = true;
    }
  }

  private async loadAccountJson(password: string): Promise<KeyringPair$Json> {
    if (!this.accountLoginData || this.selectedWallet !== AppWallet.GoogleDrive) {
      throw new Error('polkadotjs.noAccount');
    }

    const json = await GDriveWallet.accounts.getAccount(this.accountLoginData.address);

    if (!json) throw new Error('polkadotjs.noAccount');

    await this.restoreAccount({ json, password });

    return json;
  }

  async handleAccountLogin({ password }: { password: string }) {
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

        this.accountLoginVisibility = false;
        this.accountLoginData = null;
      });
    });
  }

  handleBack(): void {
    const step = getPreviousLoginStep(this.step);

    if (step === this.step) {
      this.navigate({ name: RouteNames.WalletConnection });
    } else {
      this.step = step;
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
