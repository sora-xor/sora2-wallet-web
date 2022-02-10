<template>
  <wallet-base :show-header="false" :show-back="showBackBtn" @back="handleBack">
    <div class="desktop-connection" v-loading="loading">
      <welcome-page v-if="step === LoginStep.Welcome" @create="createAccount" @import="importAccount" />
      <create-account v-else-if="isCreateFlow" :step="step" class="login" @stepChange="setStep" />
      <import-account v-else-if="isImportFlow" :step="step" class="login" @stepChange="setStep" />
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

@Component({
  components: { WalletBase, WelcomePage, CreateAccount, ImportAccount },
})
export default class DesktopConnection extends Mixins(TranslationMixin, LoadingMixin) {
  step: LoginStep = LoginStep.Welcome;

  readonly LoginStep = LoginStep;

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

  setStep(step: LoginStep): void {
    this.step = step;
  }

  handleBack(): void {
    const step = getPreviousLoginStep(this.step);
    console.log('step', step);
    this.step = step;
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
