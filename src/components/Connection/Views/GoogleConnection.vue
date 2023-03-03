<template>
  <wallet-base title="Connect via Google" :show-header="showHeader" show-back @back="handleBack">
    <external-account-list
      v-if="isAccountList"
      text="You can create or link an existing account via Google auth. It stores accounts in Gdrive using encryption."
      @create="createAccount"
      @import="importAccount"
    />
    <create-account v-else-if="isCreateFlow" :step.sync="step" />
    <!-- <import-account v-else-if="isImportFlow" :step.sync="step" /> -->
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

import { state, action, getter, mutation } from '../../../store/decorators';
import { RouteNames, LoginStep, AccountImportFlow, AccountCreateFlow } from '../../../consts';
import { getPreviousLoginStep } from '../../../util';

import type { Route } from '../../../store/router/types';

@Component({
  components: {
    WalletBase,
    CreateAccount,
    ImportAccount,
    InternalAccountList,
  },
})
export default class GoogleConnection extends Mixins(NotificationMixin, LoadingMixin) {
  @mutation.router.navigate private navigate!: (options: Route) => void;

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

  get showHeader(): boolean {
    return this.step === LoginStep.AccountList;
  }

  createAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  importAccount(): void {
    // this.step = LoginStep.Import;
  }

  navigateToAccountList(): void {
    this.step = LoginStep.AccountList;
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
