<template>
  <s-form :class="['simple-notification', { 'modal-content': modalContent }]">
    <s-icon :class="['simple-notification-icon', { success }]" :name="iconName" size="64" />
    <div class="simple-notification__title">
      <slot name="title"></slot>
    </div>
    <div v-if="$slots.text" class="simple-notification__text">
      <slot name="text"></slot>
    </div>
    <slot />
    <template v-if="optional">
      <s-divider class="simple-notification__divider" />
      <div class="simple-notification__switch">
        <s-switch v-model="optionalModel" />
        <span>{{ t('doNotShowText') }}</span>
      </div>
    </template>
    <s-button
      type="primary"
      native-type="submit"
      class="simple-notification__button s-typography-button--big"
      :loading="loading"
    >
      {{ btnText }}
    </s-button>
  </s-form>
</template>

<script lang="ts">
import { Component, Mixins, Prop, ModelSync } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class SimpleNotification extends Mixins(TranslationMixin) {
  @Prop({ default: false, type: Boolean }) readonly success!: boolean;
  @Prop({ default: false, type: Boolean }) readonly loading!: boolean;
  @Prop({ default: false, type: Boolean }) readonly optional!: boolean;
  @Prop({ default: false, type: Boolean }) readonly modalContent!: boolean;
  @Prop({ default: '', type: String }) readonly buttonText!: string;

  @ModelSync('value', 'input', { default: false, type: Boolean })
  readonly optionalModel!: boolean;

  get iconName(): string {
    return this.success ? 'basic-check-mark-24' : 'notifications-alert-triangle-24';
  }

  get btnText(): string {
    return this.buttonText || this.t('closeText');
  }
}
</script>

<style lang="scss" scoped>
.simple-notification {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  text-align: center;
  gap: $basic-spacing-medium;

  &.modal-content {
    margin-top: calc(var(--s-size-big) * -1);
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
    display: flex;
    flex-flow: column nowrap;
    gap: $basic-spacing;

    font-size: var(--s-font-size-small);
    font-weight: 300;
    line-height: var(--s-line-height-medium);
  }

  &__divider {
    margin: 0;
  }

  &__switch {
    @include switch-block;
    padding: 0;
  }

  &__button {
    width: 100%;

    & + & {
      margin-left: 0px;
    }
  }
}
</style>
