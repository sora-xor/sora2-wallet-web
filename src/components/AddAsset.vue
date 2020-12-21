<template>
  <wallet-base :title="t('addAsset.title')" show-back @back="handleBack">
    <div class="add-asset">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in AddAssetTabs"
          :key="tab"
          :label="t(`addAsset.${tab}.title`)"
          :name="tab"
        />
      </s-tabs>
      <component :is="currentTab" @add-asset="handleOpenNotification" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
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

  @Action navigate

  currentTab = AddAssetTabs.Search

  handleChangeTab (value: AddAssetTabs): void {
    this.currentTab = value
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleOpenNotification (): void {
    this.$notify({
      message: this.t('addAsset.success'),
      title: this.t('successText'),
      type: 'success'
    })
  }
}
</script>

<style lang="scss">
.add-asset {
  @include custom-tabs;
}
</style>
