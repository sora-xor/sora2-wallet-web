<template>
  <div class="asset-custom">
    <s-input
      ref="search"
      class="asset-custom-address"
      :maxlength="128"
      :placeholder="t(`addAsset.${AddAssetTabs.Custom}.addressPlaceholder`)"
      border-radius="mini"
      v-model="address"
      @change="handleSearch"
    />
    <div v-if="address && !selectedAsset" class="asset-custom-empty">
      {{ t(`addAsset.${alreadyAttached ? 'alreadyAttached' : 'empty'}`) }}
    </div>
    <s-button type="primary" :disabled="!(selectedAsset && address)" @click="navigateToAddAssetDetails">
      {{ t('addAsset.next') }}
    </s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { AccountAsset, Asset } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import { AddAssetTabs, RouteNames } from '../consts'

@Component
export default class AddAssetCustom extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs

  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate!: (options: { name: string; params?: object }) => Promise<void>
  @Action searchAsset!: (options: { address: string }) => Promise<Asset>

  address = ''
  selectedAsset: Asset | null = null
  alreadyAttached = false

  mounted (): void {
    const input = this.$refs.search as any

    if (input && typeof input.focus === 'function') {
      input.focus()
    }
  }

  async handleSearch (value: string): Promise<void> {
    this.alreadyAttached = false
    if (!value.trim()) {
      this.selectedAsset = null
      return
    }
    const search = value.trim().toLowerCase()
    const asset = await this.searchAsset({ address: search })
    if (this.accountAssets.find(({ address }) => address.toLowerCase() === search)) {
      this.selectedAsset = null
      this.alreadyAttached = true
      return
    }
    this.selectedAsset = asset
    if (!this.selectedAsset?.symbol) {
      this.selectedAsset = null
    }
  }

  navigateToAddAssetDetails (): void {
    this.navigate({ name: RouteNames.AddAssetDetails, params: { asset: this.selectedAsset } })
  }
}
</script>

<style scoped lang="scss">
.asset-custom {
  > * {
    margin-top: $basic-spacing;
  }
  &-empty {
    @include hint-text;
  }
  .el-button--primary {
    width: 100%;
  }
}
</style>
