<template>
  <s-input
    ref="input"
    v-model="query"
    class="search-input"
    prefix="s-icon-search-16"
    size="big"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #suffix>
      <s-button v-show="query" type="link" class="s-button--clear" icon="clear-X-16" @click="handleClearSearch" />
    </template>
  </s-input>
</template>

<script lang="ts">
import { Component, ModelSync, Mixins } from 'vue-property-decorator';

import InputFocusMixin from '../mixins/InputFocusMixin';

@Component
export default class SearchInput extends Mixins(InputFocusMixin) {
  @ModelSync('value', 'input', { type: String })
  readonly query!: string;

  handleClearSearch(): void {
    this.$emit('clear');
  }
}
</script>

<style lang="scss">
.search-input {
  position: relative;

  .s-button--clear {
    width: 18px;
    height: 18px;
    margin-right: -8px;
    padding: 0;
    background-color: transparent;
    border-radius: 0;
    border: none;
    &:focus {
      outline: none !important;
      i {
        @include focus-outline($inner: true, $borderRadius: 50%);
      }
    }
  }
}
</style>
