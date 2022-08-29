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
import { Component, ModelSync, Prop, Ref, Vue } from 'vue-property-decorator';

@Component
export default class SearchInput extends Vue {
  @Prop({ default: false, type: Boolean }) readonly autofocus!: boolean;

  @Ref('input') readonly input!: any;

  @ModelSync('value', 'input', { type: String })
  readonly query!: string;

  mounted(): void {
    if (this.autofocus) {
      this.focus();
    }
  }

  handleClearSearch(): void {
    this.$emit('clear');
  }

  focus(): void {
    if (this.input && typeof this.input.focus === 'function') {
      this.input.focus();
    }
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
    &.focusing {
      outline: var(--s-color-theme-accent);
    }
  }
}
</style>
