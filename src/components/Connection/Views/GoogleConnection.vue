<template>
  <wallet-base title="Connect via Google" :show-header="showHeader" show-back @back="handleBack">
    <internal-account-list
      v-if="isAccountList"
      text="You can create or link an existing account via Google auth. It stores accounts in Gdrive using encryption."
      @select="handleSelectAccount"
      @create="navigateToCreateAccount"
      @import="importAccount"
    />
    <create-account v-else-if="isCreateFlow" :step.sync="step" :create-account="handleAccountCreate" />
    <!-- <import-account v-else-if="isImportFlow" :step.sync="step" /> -->

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
import CreateAccount from '../Internal/CreateAccount.vue';
import ImportAccount from '../Internal/ImportAccount.vue';
import InternalAccountList from '../Internal/AccountList.vue';
import AccountConfirmDialog from '../../Account/ConfirmDialog.vue';

import { state, action, getter, mutation } from '../../../store/decorators';
import { RouteNames, LoginStep, AccountImportFlow, AccountCreateFlow } from '../../../consts';
import { delay, getPreviousLoginStep } from '../../../util';
import { GDriveWallet } from '../../../services/google/wallet/wallet';

import type { Route } from '../../../store/router/types';
import type { PolkadotJsAccount, KeyringPair$Json } from '../../../types/common';
import type { CreateAccountArgs } from '../../../store/account/types';

@Component({
  components: {
    WalletBase,
    CreateAccount,
    ImportAccount,
    InternalAccountList,
    AccountConfirmDialog,
  },
})
export default class GoogleConnection extends Mixins(NotificationMixin, LoadingMixin) {
  @mutation.router.navigate private navigate!: (options: Route) => void;

  @action.account.loginAccount private loginAccount!: (account: PolkadotJsAccount) => Promise<void>;

  @action.account.createAccount private createAccount!: (data: CreateAccountArgs) => Promise<KeyringPair$Json>;

  @action.account.restoreAccountFromJson private restoreAccountFromJson!: (data: {
    password: string;
    json: KeyringPair$Json;
  }) => Promise<void>;

  step: LoginStep = LoginStep.AccountList;

  accountLoginVisibility = false;
  accountLoginData: Nullable<PolkadotJsAccount> = null;

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportFlow.includes(this.step);
  }

  get isAccountList(): boolean {
    return this.step === LoginStep.AccountList;
  }

  get showHeader(): boolean {
    return this.step === LoginStep.AccountList;
  }

  navigateToCreateAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  importAccount(): void {
    // this.step = LoginStep.Import;
  }

  navigateToAccountList(): void {
    this.step = LoginStep.AccountList;
  }

  async handleAccountCreate(data: CreateAccountArgs): Promise<void> {
    const accountJson = await this.createAccount(data);

    await GDriveWallet.accounts.add(accountJson);
  }

  handleSelectAccount(account: PolkadotJsAccount, isConnected: boolean): void {
    if (isConnected) {
      this.navigate({ name: RouteNames.Wallet });
    } else {
      this.accountLoginData = account;
      this.accountLoginVisibility = true;
    }
  }

  private async restoreAccount(password: string): Promise<KeyringPair$Json> {
    if (!this.accountLoginData) throw new Error('polkadotjs.noAccount');

    const json = await GDriveWallet.accounts.getAccount(this.accountLoginData.address);

    if (!json) throw new Error('polkadotjs.noAccount');

    await this.restoreAccountFromJson({ json, password });

    return json;
  }

  async handleAccountLogin({ password }: { password: string }) {
    await this.withLoading(async () => {
      // hack: to render loading state before sync code execution
      await delay(500);

      await this.withAppNotification(async () => {
        const json = await this.restoreAccount(password);
        await this.loginAccount({
          address: json.address,
          name: (json.meta.name as string) || '',
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
