<template>
  <wallet-base :title="t('createToken.title')" show-back :showHeader="showAdditionalInfo" @back="handleBack">
    <div class="token">
      <s-tabs v-if="showTabs" :value="currentTab" type="rounded" @change="handleChangeTab" class="token__tab">
        <s-tab v-for="tab in TokenTabs" :key="tab" :label="t(`createToken.${tab}`)" :name="tab" />
      </s-tabs>
      <component :is="currentTab" @showTabs="setTabVisibility" @stepChange="setStep" :step="currentStep" />
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
  currentTab: TokenTabs = TokenTabs.Token;
  showTabs = true;
  showAdditionalInfo = true;

  get currentStep(): Step {
    return this.step;
  }

  handleChangeTab(value: TokenTabs): void {
    this.currentTab = value;
  }

  setTabVisibility(): void {
    this.showTabs = !this.showTabs;
  }

  setStep(step: Step): void {
    if ([Step.CreateToken, Step.CreateNFT].includes(step)) this.setTabVisibility();
    this.step = step;
  }

  handleBack(): void {
    if ([Step.CreateToken, Step.CreateNFT].includes(this.step)) {
      this.navigate({ name: RouteNames.Wallet });
    }

    if (this.step === Step.ConfirmToken) {
      this.showTabs = true;
      this.step = Step.CreateToken;
      // this.showAdditionalInfo = true;
      this.navigate({ name: RouteNames.Token });
    }

    if (this.step === Step.ConfirmNFT) {
      this.showTabs = true;
      // this.showAdditionalInfo = true;
      this.step = Step.CreateNFT;
    }
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
