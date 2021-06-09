<template>
  <s-card primary class="base" border-radius="medium" shadow="always" size="big">
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
        <!-- <s-button
          v-if="showCleanHistory"
          class="base-title_trash"
          type="action"
          icon="basic-trash-24"
          :disabled="disabledCleanHistory"
          :tooltip="t('history.clearHistory')"
          @click="handleCleanHistoryClick"
        /> -->
        <s-button
          v-if="showClose"
          class="base-title_close"
          type="action"
          rounded
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
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean
  @Prop({ default: false, type: Boolean }) readonly showAction!: boolean
  @Prop({ default: false, type: Boolean }) readonly disabledCleanHistory!: boolean
  @Prop({ default: false, type: Boolean }) readonly showCleanHistory!: boolean
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
  @Prop({ default: '', type: String }) readonly actionTooltip!: string
  @Prop({ default: '', type: String }) readonly actionIcon!: string

  @Action navigate

  get headerClasses (): Array<string> {
    const cssClasses: Array<string> = ['base-title', 's-flex']
    if (this.showBack) {
      cssClasses.push('base-title--center')
    }
    // if (this.showCleanHistory) {
    //   cssClasses.push('base-title--has-history')
    // }
    // if (this.showAction && (this.showClose || this.showCleanHistory)) {
    if (this.showAction && this.showClose) {
      cssClasses.push('base-title--actions')
    }
    return cssClasses
  }

  handleBackClick (): void {
    this.$emit('back')
  }

  handleActionClick (): void {
    this.$emit('action')
  }

  handleCleanHistoryClick (): void {
    this.$emit('cleanHistory')
  }

  handleCloseClick (): void {
    this.$emit('close')
  }
}
</script>

<style lang="scss">
.base {
  .el-loading-mask {
    background-color: var(--s-color-utility-surface);
  }
}
</style>

<style scoped lang="scss">
$button-size: var(--s-size-medium);

.base {
  width: $wallet-width;
  font-size: var(--s-font-size-small);
  line-height: var(--s-line-height-base);

  &-title {
    position: relative;
    height: $button-size;
    align-items: center;
    padding-right: calc(#{$button-size} + calc(var(--s-basic-spacing) * 2));
    margin-bottom: calc(var(--s-basic-spacing) * 2);
    &--center {
      padding-left: calc(#{$button-size} + calc(var(--s-basic-spacing) * 2));
      text-align: center;
    }
    &--has-history {
      .base-title_action {
        right: calc(var(--s-size-medium) + var(--s-basic-spacing));
      }
    }
    &--actions {
      &.base-title--center {
        padding-left: calc(#{$button-size} * 2 + calc(var(--s-basic-spacing) * 2));
      }
      padding-right: calc(#{$button-size} * 2 + calc(var(--s-basic-spacing) * 2));
      .base-title_action {
        right: calc(#{$button-size} + var(--s-basic-spacing));
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
      font-size: var(--s-font-size-large);
      line-height: var(--s-line-height-small);
      font-weight: 300;
      letter-spacing: var(--s-letter-spacing-mini);
    }
    &_back {
      left: 0;
    }
    &_action, &_trash, &_close {
      right: 0;
    }
  }
}
</style>
