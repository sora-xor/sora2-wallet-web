<template>
  <div class="token-search">
    <s-input
      class="token-search-input"
      :maxlength="100"
      :placeholder="t(`addToken.${AddTokenTabs.Search}.placeholder`)"
      v-model="search"
      @change="handleSearch"
    />
    <div class="token-search-list">
      <div class="token-search-list_info" v-if="!(search || foundTokens.length)">
        {{ t(`addToken.${AddTokenTabs.Search}.info`) }}
      </div>
      <div v-if="search && !foundTokens.length" class="token-search-list_empty">
        {{ t(`addToken.${AddTokenTabs.Search}.empty`) }}
      </div>
      <div
        class="token s-flex"
        v-for="token in foundTokens"
        :key="token.address"
        :class="{ 'selected': (selectedToken || {}).address === token.address }"
        @click="handleSelectToken(token)"
      >
        <i :class="getTokenClasses(token.symbol)" />
        <div class="token-description s-flex">
          <div class="token-description_name">{{ token.name }}</div>
          <div class="token-description_symbol">{{ token.symbol }}</div>
        </div>
      </div>
    </div>
    <div class="token-search-actions s-flex">
      <s-button @click="handleBack">
        {{ t('addToken.cancel') }}
      </s-button>
      <s-button type="primary" :disabled="!selectedToken" @click="handleAddToken">
        {{ t('addToken.action') }}
      </s-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'
import { AddTokenTabs, RouteNames } from '../consts'
import { getTokenIconClasses } from '../util'

@Component
export default class AddTokenSearch extends Mixins(TranslationMixin) {
  readonly AddTokenTabs = AddTokenTabs

  @Getter tokens!: Array<any>
  @Action navigate
  @Action getTokens
  @Action addToken

  search = ''
  selectedToken: any = null
  foundTokens: Array<any> = []

  mounted (): void {
    // TODO: there is should be full_list_with_tokens - already_attached_tokens
    // For now it's just for tests
    this.getTokens()
  }

  handleSearch (value: string): void {
    if (!value.trim()) {
      this.foundTokens = []
      this.selectedToken = null
      return
    }
    const search = value.trim().toLowerCase()
    this.foundTokens = this.tokens.filter(({ name, symbol, address }) => {
      return symbol.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search) ||
        address.toLowerCase().includes(search)
    })
    if (this.selectedToken && !this.foundTokens.find(({ address }) => this.selectedToken.address === address)) {
      this.selectedToken = null
    }
  }

  handleSelectToken (token: any): void {
    this.selectedToken = token
  }

  handleBack (): void {
    this.navigate({ name: RouteNames.Wallet })
  }

  async handleAddToken (): Promise<void> {
    await this.addToken({ token: this.selectedToken })
    this.navigate({ name: RouteNames.Wallet })
    this.$emit('add-token')
  }

  getTokenClasses (symbol: string): string {
    return getTokenIconClasses(symbol)
  }
}
</script>

<style scoped lang="scss">
@import '../styles/layout';
@import '../styles/typography';
@import '../styles/soramitsu-variables';
@import '../styles/mixins';

$token-list-height: 350px;

.token-search {
  margin-top: $basic-spacing;
  &-input {
    margin-bottom: $basic-spacing;
  }
  &-list {
    height: $token-list-height;
    overflow-y: auto;
    margin-bottom: $basic-spacing;
    &_info, &_empty {
      font-size: $font-size_small;
      color: $s-color-base-content-tertiary;
    }
    &_empty {
      text-align: center;
    }
    .token {
      align-items: center;
      padding: $basic-spacing_mini / 2;
      margin-right: $basic-spacing_mini / 2;
      border-radius: $basic-spacing_mini;
      &:hover, &.selected {
        background-color: $s-color-base-background-hover;
        cursor: pointer;
      }
      &-logo {
        margin-right: $basic-spacing;
        @include token-logo-styles;
      }
      &-description {
        flex: 1;
        flex-direction: column;
        &_name {
          font-weight: bold;
        }
        &_symbol {
          font-size: $font-size_small;
          color: $s-color-base-content-tertiary;
        }
      }
      &:not(:last-child) {
        margin-bottom: $basic-spacing / 2;
      }
    }
  }
  &-actions {
    > * {
      flex: .5;
    }
  }
}
</style>
