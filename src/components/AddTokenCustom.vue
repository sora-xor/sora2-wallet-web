<template>
  <div class="token-custom">
    <s-input
      class="token-custom-address"
      :maxlength="128"
      :placeholder="t(`addToken.${AddTokenTabs.Custom}.addressPlaceholder`)"
      v-model="address"
      @change="handleSearch"
    />
    <s-input
      class="token-custom-symbol"
      :maxlength="10"
      :placeholder="t(`addToken.${AddTokenTabs.Custom}.symbolPlaceholder`)"
      v-model="symbol"
    />
    <div class="token-custom-actions s-flex">
      <s-button @click="handleBack">{{ t('addToken.cancel') }}</s-button>
      <s-button type="primary" :disabled="!(symbol && address)" @click="handleAddToken">
        {{ t('addToken.action') }}
      </s-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { AddTokenTabs, RouteNames } from '../consts'
import { getTokenIconClasses } from '../util'

@Component
export default class AddTokenCustom extends Mixins(TranslationMixin) {
  readonly AddTokenTabs = AddTokenTabs

  @Action navigate
  @Action searchToken
  @Action addToken

  address = ''
  symbol = ''
  selectedToken: any = null

  async handleSearch (value: string): Promise<void> {
    if (!value.trim()) {
      this.selectedToken = null
      this.symbol = ''
      return
    }
    const search = value.trim().toLowerCase()
    // TODO: there is shouldn't be an already attached token
    // For now it's just for tests
    this.selectedToken = await this.searchToken({ search })
    if (this.selectedToken && this.selectedToken.symbol) {
      this.symbol = this.selectedToken.symbol
    } else {
      this.selectedToken = null
      this.symbol = ''
    }
  }

  handleSelectToken (token: any): void {
    this.selectedToken = token
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleAddToken (): Promise<void> {
    const token = { symbol: this.symbol, address: this.address }
    await this.addToken({ token })
    this.navigate({ name: RouteNames.Wallet })
    this.$emit('add-token')
  }
}
</script>

<style scoped lang="scss">
.token-custom {
  > * {
    margin-top: $basic-spacing;
  }
  &-actions {
    > * {
      flex: .5;
    }
  }
}
</style>
