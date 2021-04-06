<template>
  <s-card class="base" border-radius="medium">
    <template #header>
      <div :class="headerClasses">
        <s-button
          v-if="showBack"
          class="base-title_back"
          type="action"
          icon="arrows-chevron-left-rounded-24"
          :tooltip="t('backText')"
          @click="handleBackClick"
        />
        <h3 class="base-title_text">{{ title }}</h3>
        <s-button
          v-if="showAction"
          class="base-title_action"
          type="action"
          :icon="actionIcon"
          :tooltip="t(actionTooltip)"
          @click="handleActionClick"
        />
        <s-button
          v-if="showClose"
          class="base-title_close"
          type="action"
          icon="basic-close-24"
          :tooltip="t('closeText')"
          @click="handleCloseClick"
        />
      </div>
    </template>
    <slot />
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class'

import TranslationMixin from './mixins/TranslationMixin'

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean
  @Prop({ default: false, type: Boolean }) readonly showAction!: boolean
  @Prop({ default: '', type: String }) readonly actionTooltip!: string
  @Prop({ default: '', type: String }) readonly actionIcon!: string

  @Action navigate

  get headerClasses (): Array<string> {
    const cssClasses: Array<string> = ['base-title', 's-flex']
    if (this.showBack) {
      cssClasses.push('base-title--center')
    }
    if (this.showAction && this.showClose) {
      cssClasses.push('base-title--actions')
    }
    return cssClasses
  }

  handleBackClick (): void {
    this.$emit('back')
  }

  handleCloseClick (): void {
    this.$emit('close')
  }

  handleActionClick (): void {
    this.$emit('action')
  }
}
</script>

<style scoped lang="scss">
$button-size: var(--s-size-medium);

.base {
  @include s-card-styles;
  width: $wallet-width;
  font-size: $font-size_basic;
  line-height: $line-height_basic;
  &-title {
    position: relative;
    height: $button-size;
    align-items: center;
    padding-right: calc(#{$button-size} + #{$basic-spacing});
    &--center {
      padding-left: calc(#{$button-size} + #{$basic-spacing});
      text-align: center;
    }
    &--actions {
      padding-left: calc(#{$button-size} * 2 + #{$basic-spacing});
      padding-right: calc(#{$button-size} * 2 + #{$basic-spacing});
      .base-title_action {
        right: calc(#{$button-size} + #{$basic-spacing_mini});
      }
    }
    .el-button {
      position: absolute;
    }
    &_text {
      flex: 1;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    &_back {
      left: 0;
    }
    &_close, &_action {
      right: 0;
    }
  }
}
</style>
