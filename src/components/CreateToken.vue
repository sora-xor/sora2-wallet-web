<template>
  <wallet-base :title="createTokenTitle" show-back :showHeader="showHeader" @back="handleBack">
    <div class="token">
      <s-tabs v-if="showTabs" :value="currentTab" type="rounded" @change="handleChangeTab" class="token__tab">
        <s-tab v-for="tab in TokenTabs" :key="tab" :label="t(`createToken.${tab}`)" :name="tab" />
      </s-tabs>
      <component
        :is="currentTab"
        @showTabs="setTabVisibility"
        @showHeader="setHeaderVisibility"
        @stepChange="setStep"
        :step="currentStep"
      />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import TranslationMixin from './mixins/TranslationMixin';
import CreateSimpleToken from './CreateSimpleToken.vue';
import CreateNftToken from './CreateNftToken.vue';
import WalletBase from './WalletBase.vue';

import { TokenTabs, Step, RouteNames } from '../consts';

@Component({
  components: {
    WalletBase,
    CreateSimpleToken,
    CreateNftToken,
  },
})
export default class CreateToken extends Mixins(TranslationMixin) {
  readonly TokenTabs = TokenTabs;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  step: Step = Step.CreateSimpleToken;
  currentTab: Step = Step.CreateSimpleToken;
  showTabs = true;
  showHeader = true;
  createTokenTitle = this.t('createToken.titleCommon');

  get currentStep(): Step {
    return this.step;
  }

  handleChangeTab(value: Step): void {
    this.step = value;
    this.currentTab = value;
  }

  setTabVisibility(): void {
    this.showTabs = !this.showTabs;
  }

  setHeaderVisibility(): void {
    this.showHeader = !this.showHeader;
  }

  setStep(step: Step): void {
    if ([Step.CreateSimpleToken, Step.CreateNftToken].includes(step)) this.setTabVisibility();
    if (step === Step.ConfirmSimpleToken) this.createTokenTitle = this.t('createToken.confirmTokenTitleCommon');
    if (step === Step.ConfirmNftToken) this.createTokenTitle = this.t('createToken.confirmTokenTitleNFT');
    this.step = step;
  }

  handleBack(): void {
    if ([Step.CreateSimpleToken, Step.CreateNftToken].includes(this.step)) {
      this.navigate({ name: RouteNames.Wallet });
      return;
    }

    if ([Step.ConfirmSimpleToken, Step.ConfirmNftToken].includes(this.step)) {
      if (this.step === Step.ConfirmSimpleToken) this.step = Step.CreateSimpleToken;
      if (this.step === Step.ConfirmNftToken) this.step = Step.CreateNftToken;

      this.createTokenTitle = this.t('createToken.titleCommon');
    } else if (this.step === Step.Warn) {
      if (this.currentTab === Step.CreateSimpleToken) this.step = Step.CreateSimpleToken;
      if (this.currentTab === Step.CreateNftToken) this.step = Step.CreateNftToken;
    }

    this.showTabs = true;
    this.showHeader = true;
    this.navigate({ name: RouteNames.CreateToken });
  }
}
</script>

<style lang="scss">
.token {
  @include custom-tabs;

  &__tab {
    margin-bottom: #{$basic-spacing-medium};
  }
}
</style>
