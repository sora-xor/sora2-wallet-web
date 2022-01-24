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
import CreateToken from './CreateToken.vue';
import CreateNFT from './CreateNFT.vue';
import WalletBase from './WalletBase.vue';

import { TokenTabs, Step, RouteNames } from '../consts';

@Component({
  components: {
    WalletBase,
    CreateToken,
    CreateNFT,
  },
})
export default class Token extends Mixins(TranslationMixin) {
  readonly TokenTabs = TokenTabs;
  readonly Step = Step;

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>;

  step: Step = Step.CreateToken;
  currentTab: Step = Step.CreateToken;
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
    if ([Step.CreateToken, Step.CreateNFT].includes(step)) this.setTabVisibility();
    if (step === Step.ConfirmToken) this.createTokenTitle = this.t('createToken.confirmTokenTitleCommon');
    if (step === Step.ConfirmNFT) this.createTokenTitle = this.t('createToken.confirmTokenTitleNFT');
    this.step = step;
  }

  handleBack(): void {
    if ([Step.CreateToken, Step.CreateNFT].includes(this.step)) {
      this.navigate({ name: RouteNames.Wallet });
      return;
    }

    if ([Step.ConfirmToken, Step.ConfirmNFT].includes(this.step)) {
      if (this.step === Step.ConfirmToken) this.step = Step.CreateToken;
      if (this.step === Step.ConfirmNFT) this.step = Step.CreateNFT;

      this.createTokenTitle = this.t('createToken.titleCommon');
    }

    if (this.step === Step.Warn) {
      if (this.currentTab === Step.CreateToken) this.step = Step.CreateToken;
      if (this.currentTab === Step.CreateNFT) this.step = Step.CreateNFT;
    }

    this.showTabs = true;
    this.showHeader = true;
    this.navigate({ name: RouteNames.Token });
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
