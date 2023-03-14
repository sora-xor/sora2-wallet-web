<template>
  <wallet-base title="Connect via Google" :show-header="showHeader" show-back @back="handleBack">
    <account-list-step
      v-if="isAccountList"
      text="You can create or link an existing account via Google auth. It stores accounts in Gdrive using encryption."
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
import ImportAccountStep from '../Step/ImportInternalAccount.vue';
import AccountListStep from '../Step/AccountList.vue';
import AccountConfirmDialog from '../../Account/ConfirmDialog.vue';

import { action, mutation } from '../../../store/decorators';
import { RouteNames, LoginStep, AccountImportInternalFlow, AccountCreateFlow } from '../../../consts';
import { delay, getPreviousLoginStep } from '../../../util';
import { GDriveWallet } from '../../../services/google/wallet/wallet';

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
export default class GoogleConnection extends Mixins(NotificationMixin, LoadingMixin) {
  @mutation.router.navigate private navigate!: (options: Route) => void;

  @action.account.loginAccount private loginAccount!: (account: PolkadotJsAccount) => Promise<void>;

  @action.account.createAccount private createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;

  @action.account.restoreAccountFromJson private restoreAccount!: (data: RestoreAccountArgs) => Promise<void>;

  step: LoginStep = LoginStep.AccountList;

  accountLoginVisibility = false;
  accountLoginData: Nullable<PolkadotJsAccount> = null;

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

        await GDriveWallet.accounts.add(json);

        this.navigateToAccountList();
      });
    });
  }

  async handleAccountCreate(data: CreateAccountArgs): Promise<void> {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay();

      await this.withAppNotification(async () => {
        const accountJson = await this.createAccount(data);

        await GDriveWallet.accounts.add(accountJson);

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
    if (!this.accountLoginData) throw new Error('polkadotjs.noAccount');

    const json = await GDriveWallet.accounts.getAccount(this.accountLoginData.address);

    if (!json) throw new Error('polkadotjs.noAccount');

    await this.restoreAccount({ json, password });

    return json;
  }

  async handleAccountLogin({ password }: { password: string }) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay();

      await this.withAppNotification(async () => {
        const { address, meta } = await this.loadAccountJson(password);

        await this.loginAccount({
          address,
          name: (meta.name as string) || '',
          source: GDriveWallet.name,
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
}
</script>
