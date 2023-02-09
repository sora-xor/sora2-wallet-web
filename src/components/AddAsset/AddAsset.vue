<template>
  <wallet-base :title="t('addAssetText')" show-back :reset-focus="currentScreen" @back="handleBack">
    <div class="add-asset">
      <s-tabs v-if="showTabs" v-model="currentTab" type="rounded">
        <s-tab v-for="tab in AddAssetTabs" :key="tab" :label="getTabName(tab)" :name="tab" />
      </s-tabs>
      <keep-alive>
        <component
          :is="currentTab"
          :tokenDetailsPageOpened="tokenDetailsPageOpened"
          @change-visibility="changeVisibility"
        />
      </keep-alive>
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from '../mixins/TranslationMixin';
import WalletBase from '../WalletBase.vue';
import AddAssetToken from './AddAssetTokenTab.vue';
import AddAssetNFT from './AddAssetNftTab.vue';
import { RouteNames, AddAssetTabs } from '../../consts';
import { mutation } from '../../store/decorators';
import type { Route } from '../../store/router/types';

@Component({
  components: {
    WalletBase,
    AddAssetToken,
    AddAssetNFT,
  },
})
export default class AddAsset extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  currentTab = AddAssetTabs.Token;

  showTabs = true;
  tokenDetailsPageOpened = false;

  get currentScreen(): string {
    return `${this.currentTab}${this.tokenDetailsPageOpened}`;
  }

  getTabName(tab: AddAssetTabs): string {
    if (tab === AddAssetTabs.NFT) {
      return this.TranslationConsts.NFT;
    }
    return this.t(`addAsset.${tab}.title`);
  }

  changeVisibility(): void {
    this.showTabs = false;
    this.tokenDetailsPageOpened = true;
  }

  handleBack(): void {
    if (!this.showTabs) {
      this.showTabs = true;
      this.tokenDetailsPageOpened = false;
      return;
    }

    this.navigate({ name: RouteNames.Wallet });
  }
}
</script>

<style lang="scss">
.add-asset {
  @include custom-tabs;
}
</style>
