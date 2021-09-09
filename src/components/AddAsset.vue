<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in AddAssetTabs"
          :key="tab"
          :label="t(`addAsset.${tab}.title`)"
          :name="tab"
          :disabled="tab === AddAssetTabs.Custom /* TODO: uncomment it when we'll know what this tab should actually do */"
        />
      </s-tabs>
      <component :is="currentTab" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import AddAssetSearch from './AddAssetSearch.vue'
import AddAssetCustom from './AddAssetCustom.vue'
import { RouteNames, AddAssetTabs } from '../consts'

@Component({
  components: {
    WalletBase,
    AddAssetSearch,
    AddAssetCustom
  }
})
export default class AddAsset extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs

  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>

  currentTab = AddAssetTabs.Search

  handleChangeTab (value: AddAssetTabs): void {
    this.currentTab = value
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
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
