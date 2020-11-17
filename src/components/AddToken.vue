<template>
  <wallet-base :title="t('addToken.title')" show-back @back="handleBack">
    <div class="add-token">
      <s-tabs :value="currentTab" type="rounded" @change="handleChangeTab">
        <s-tab
          v-for="tab in AddTokenTabs"
          :key="tab"
          :label="t(`addToken.${tab}.title`)"
          :name="tab"
        />
      </s-tabs>
      <component :is="currentTab" @add-token="handleOpenNotification" />
    </div>
  </wallet-base>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import WalletBase from './WalletBase.vue'
import AddTokenSearch from './AddTokenSearch.vue'
import AddTokenCustom from './AddTokenCustom.vue'
import { RouteNames, AddTokenTabs } from '../consts'

@Component({
  components: {
    WalletBase,
    AddTokenSearch,
    AddTokenCustom
  }
})
export default class AddToken extends Mixins(TranslationMixin) {
  readonly AddTokenTabs = AddTokenTabs

  @Action navigate

  currentTab = AddTokenTabs.Search

  handleChangeTab (value: AddTokenTabs): void {
    this.currentTab = value
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  handleOpenNotification (): void {
    this.$notify({
      message: this.t('addToken.success'),
      title: this.t('successText'),
      type: 'success'
    })
  }
}
</script>

<style lang="scss">
.add-token {
  @include custom-tabs;
}
</style>
