<template>
  <s-scrollbar :class="classes">
    <div class="connection-items-list">
      <slot />
    </div>
  </s-scrollbar>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ConnectionItems extends Vue {
  @Prop({ default: 0, type: Number }) readonly size!: number;

  get classes() {
    const base = 'connection-items';
    const classes = [base];

    if (this.size >= 7) {
      classes.push(`${base}-fixed`);
    }

    return classes;
  }
}
</script>

<style lang="scss">
$item-height: 60px;
$item-margin-bottom: $basic-spacing;
$item-number: 7;

.connection-items {
  @include scrollbar($basic-spacing-big);

  &-fixed {
    height: calc(calc(#{$item-height} + #{$item-margin-bottom}) * #{$item-number} - #{$item-margin-bottom});
  }

  &-list {
    & > .account {
      @include focus-outline($withOffset: true);
      height: $item-height;

      &:hover {
        cursor: pointer;
        border-color: var(--s-color-base-content-secondary) !important;
      }

      a {
        @include focus-outline($borderRadius: var(--s-border-radius-small));
      }

      &:not(:last-child) {
        margin-bottom: $item-margin-bottom;
      }
    }
  }
}
</style>
