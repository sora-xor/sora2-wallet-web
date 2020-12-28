<template>
  <div class="asset-custom">
    <s-input
      class="asset-custom-address"
      :maxlength="128"
      :placeholder="t(`addAsset.${AddAssetTabs.Custom}.addressPlaceholder`)"
      border-radius="mini"
      v-model="address"
      @change="handleSearch"
    />
    <s-input
      v-if="symbol"
      class="asset-custom-symbol"
      :maxlength="10"
      :placeholder="t(`addAsset.${AddAssetTabs.Custom}.symbolPlaceholder`)"
      border-radius="mini"
      readonly
      v-model="symbol"
    />
    <div v-if="address && !symbol" class="asset-custom-empty">
      {{ t(`addAsset.${alreadyAttached ? 'alreadyAttached' : 'empty'}`) }}
    </div>
    <div class="asset-custom-actions s-flex">
      <s-button @click="handleBack">{{ t('addAsset.cancel') }}</s-button>
      <s-button type="primary" :disabled="!(symbol && address)" @click="handleAddAsset">
        {{ t('addAsset.action') }}
      </s-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class'
import { AccountAsset, Asset } from '@sora-substrate/util'

import TranslationMixin from './mixins/TranslationMixin'
import { AddAssetTabs, RouteNames } from '../consts'
import { getAssetIconClasses } from '../util'

@Component
export default class AddAssetCustom extends Mixins(TranslationMixin) {
  readonly AddAssetTabs = AddAssetTabs

  @Getter accountAssets!: Array<AccountAsset>
  @Action navigate
  @Action searchAsset
  @Action addAsset

  address = ''
  symbol = ''
  selectedAsset: Asset | null = null
  alreadyAttached = false

  async handleSearch (value: string): Promise<void> {
    this.alreadyAttached = false
    if (!value.trim()) {
      this.selectedAsset = null
      this.symbol = ''
      return
    }
    const search = value.trim().toLowerCase()
    const asset = await this.searchAsset({ address: search })
    if (this.accountAssets.find(({ address }) => address.toLowerCase() === search)) {
      this.selectedAsset = null
      this.symbol = ''
      this.alreadyAttached = true
      return
    }
    this.selectedAsset = asset
    if (this.selectedAsset && this.selectedAsset.symbol) {
      this.symbol = this.selectedAsset.symbol
    } else {
      this.selectedAsset = null
      this.symbol = ''
    }
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleAddAsset (): Promise<void> {
    await this.addAsset({ address: this.address })
    this.navigate({ name: RouteNames.Wallet })
    this.$emit('add-asset')
  }
}
</script>

<style scoped lang="scss">
// TODO: think about mixin here
.asset-custom {
  > * {
    margin-top: $basic-spacing;
  }
  &-empty {
    @include hint-text;
  }
  &-actions {
    > * {
      flex: .5;
    }
  }
}
</style>
