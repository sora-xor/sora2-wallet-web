<template>
  <wallet-base title="Connect via Google">
    <external-account-list
      v-if="isAccountList"
      text="You can create or link an existing account via Google auth. It stores accounts in Gdrive using encryption."
    />
    <create-account v-else-if="isCreateFlow" :step="step" />
    <import-account v-else-if="isImportFlow" :step="step" />
  </wallet-base>
</template>

<script lang="ts">
import { Mixins, Component } from 'vue-property-decorator';

import LoadingMixin from '../../mixins/LoadingMixin';
import NotificationMixin from '../../mixins/NotificationMixin';

import WalletBase from '../../WalletBase.vue';
import ExternalAccountList from '../External/AccountList.vue';
import CreateAccount from '../Desktop/CreateAccount.vue';
import ImportAccount from '../Desktop/ImportAccount.vue';

import { LoginStep, AccountImportFlow, AccountCreateFlow } from '../../../consts';
import { getPreviousLoginStep } from '../../../util';

@Component({
  components: {
    WalletBase,
    CreateAccount,
    ImportAccount,
    ExternalAccountList,
  },
})
export default class GoogleConnection extends Mixins(NotificationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.AccountList;

  readonly LoginStep = LoginStep;

  get isCreateFlow(): boolean {
    return AccountCreateFlow.includes(this.step);
  }

  get isImportFlow(): boolean {
    return AccountImportFlow.includes(this.step);
  }

  get isAccountList(): boolean {
    return this.step === LoginStep.AccountList;
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
}
</script>
