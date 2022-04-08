<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in AddAssetTabs"
          :key="tab"
          :label="t(`addAsset.${tab}.title`)"
          :name="tab"
          :disabled="
            tab === AddAssetTabs.Custom /* TODO: uncomment it when we'll know what this tab should actually do */
          "
        />
      </s-tabs>
      <component :is="currentTab" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import WalletBase from './WalletBase.vue';
import AddAssetSearch from './AddAssetSearch.vue';
import AddAssetCustom from './AddAssetCustom.vue';
import { RouteNames, AddAssetTabs } from '../consts';
import { mutation } from '../store/decorators';
import type { Route } from '../store/router/types';

@Component({
  components: {
    WalletBase,
    AddAssetSearch,
    AddAssetCustom,
  },
})
export default class AddAsset extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs;

  @mutation.router.navigate private navigate!: (options: Route) => void;

  currentTab = AddAssetTabs.Search;

  handleChangeTab(value: AddAssetTabs): void {
    this.currentTab = value;
  }

  handleBack(): void {
    this.navigate({ name: RouteNames.Wallet });
  }
}
</script>

<style lang="scss">
.add-asset {
  @include custom-tabs;
  #tab-AddAssetCustom.is-disabled {
    color: var(--s-color-base-content-tertiary);
  }
}
</style>
