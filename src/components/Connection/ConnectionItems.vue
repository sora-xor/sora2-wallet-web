<template>
  <s-scrollbar class="connection-items">
    <div class="connection-items-list">
      <slot />
    </div>
  </s-scrollbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class ConnectionItems extends Vue {}
</script>

<style lang="scss">
$item-height: 60px;
$item-margin-bottom: var(--s-basic-spacing);
$item-padding: calc(#{$item-margin-bottom} / 2);
$item-number: 7;

.connection-items {
  @include scrollbar($basic-spacing-big);

  height: calc(calc(#{$item-height} + #{$item-margin-bottom}) * #{$item-number} - #{$item-margin-bottom});

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
        margin-bottom: var(--s-basic-spacing);
      }
    }
  }
}
</style>
