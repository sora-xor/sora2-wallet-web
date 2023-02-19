<template>
  <div class="simple-notification">
    <s-icon :class="['simple-notification-icon', { success }]" :name="iconName" size="64" />
    <div class="simple-notification__title">
      <slot name="title"></slot>
    </div>
    <div v-if="$slots.text" class="simple-notification__text">
      <slot name="text"></slot>
    </div>
    <slot />
    <s-button type="secondary" class="simple-notification__button s-typography-button--big" @click="close">{{
      t('closeText')
    }}</s-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class SimpleNotification extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) success!: boolean;

  get iconName(): string {
    return this.success ? 'basic-check-mark-24' : 'notifications-alert-triangle-24';
  }

  close(): void {
    this.$emit('close');
  }
}
</script>

<style lang="scss" scoped>
.simple-notification {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  text-align: center;

  & > *:not(:first-child) {
    margin-top: $basic-spacing-medium;
  }

  &-icon {
    color: var(--s-color-status-error);
    margin-bottom: $basic-spacing;

    &.success {
      color: var(--s-color-theme-secondary);
    }
  }

  &__title {
    font-size: var(--s-font-size-large);
    font-weight: 300;
    letter-spacing: var(--s-letter-spacing-mini);
    line-height: var(--s-line-height-small);
  }

  &__text {
    font-size: var(--s-font-size-small);
    font-weight: 300;
    line-height: var(--s-line-height-medium);
  }

  &__button {
    width: 100%;

    & + & {
      margin-top: $basic-spacing-small;
    }
  }
}
</style>