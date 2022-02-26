<template>
  <wallet-base :title="t('connection.title')" :show-header="showHeader" :show-back="showBackBtn" @back="handleBack">
    <div class="desktop-connection" v-loading="loading">
      <connected-account-list v-if="polkadotJsAccounts.length" @handleSelectAccount="handleSelectAccount" />
      <div v-else>
        <welcome-page v-if="step === LoginStep.Welcome" @create="createAccount" @import="importAccount" />
        <create-account v-else-if="isCreateFlow" :step="step" class="login" @stepChange="setStep" />
        <import-account v-else-if="isImportFlow" :step="step" class="login" @stepChange="setStep" />
      </div>
    </div>
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

@Component({
  components: { WalletBase, WelcomePage, CreateAccount, ImportAccount, ConnectedAccountList },
})
export default class DesktopConnection extends Mixins(TranslationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

  @Getter currentRouteParams!: any;
  @Getter polkadotJsAccounts!: Array<PolkadotJsAccount>;

  @Action importPolkadotJs!: (address: string) => Promise<void>;

  createAccount(): void {
    this.step = LoginStep.SeedPhrase;
  }

  importAccount(): void {
    this.step = LoginStep.Import;
  }

  get isCreateFlow(): boolean {
    return [LoginStep.SeedPhrase, LoginStep.ConfirmSeedPhrase, LoginStep.CreateCredentials].includes(this.step);
  }

  get isImportFlow(): boolean {
    return [LoginStep.Import, LoginStep.ImportCredentials].includes(this.step);
  }

  get showBackBtn(): boolean {
    return LoginStep.Welcome !== this.step;
  }

  get showHeader(): boolean {
    return false;
  }

  get isAccountSwitch(): boolean {
    // console.log('this.currentRouteParams', this.currentRouteParams);
    // console.log('(this.currentRouteParams || {}).isAccountSwitch', (this.currentRouteParams || {}).isAccountSwitch);
    return (this.currentRouteParams || {}).isAccountSwitch;
  }

  setStep(step: LoginStep): void {
    this.step = step;
  }

  handleBack(): void {
    const step = getPreviousLoginStep(this.step);
    this.step = step;
  }

  async handleSelectAccount(account: PolkadotJsAccount): Promise<void> {
    await this.withLoading(async () => {
      try {
        await this.importPolkadotJs(account.address);
      } catch (error) {
        this.$alert(this.t((error as Error).message), this.t('errorText'));
      }
    });
  }

  async mounted(): Promise<void> {
    await this.withApi(async () => {
      if (this.isAccountSwitch) {
        this.navigateToAccountList();
      }
    });
  }

  private navigateToAccountList(): void {
    // this.step = Step.Second;
  }
}
</script>

<style lang="scss">
.desktop-connection {
}

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
