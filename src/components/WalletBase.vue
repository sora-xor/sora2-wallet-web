<template>
  <s-card primary class="base" border-radius="medium" shadow="always" size="big">
    <template #header>
      <div :class="headerClasses">
        <s-button
          v-if="showBack"
          class="base-title_back"
          type="action"
          :tooltip="t('backText')"
          @click="handleBackClick"
        >
          <s-icon name="arrows-chevron-left-rounded-24" size="28" />
        </s-button>
        <h3 class="base-title_text">
          {{ title }}
          <s-tooltip
            v-if="tooltip"
            class="base-title_tooltip"
            popper-class="info-tooltip base-title_tooltip-popper"
            border-radius="mini"
            :content="tooltip"
            placement="right"
          >
            <s-icon name="info-16" size="18px" />
          </s-tooltip>
        </h3>
        <s-button
          v-if="showAction"
          class="base-title_action"
          type="action"
          :tooltip="t(actionTooltip)"
          @click="handleActionClick"
        >
          <s-icon :name="actionIcon" size="28" />
        </s-button>
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
        >
          <s-icon name="basic-close-24" size="28" />
        </s-button>
      </div>
    </template>
    <slot />
  </s-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'

import TranslationMixin from './mixins/TranslationMixin'

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string
  @Prop({ default: '', type: String }) readonly tooltip!: string
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean
  @Prop({ default: false, type: Boolean }) readonly showAction!: boolean
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean
  @Prop({ default: '', type: String }) readonly actionTooltip!: string
  @Prop({ default: '', type: String }) readonly actionIcon!: string
  // @Prop({ default: false, type: Boolean }) readonly disabledCleanHistory!: boolean
  // @Prop({ default: false, type: Boolean }) readonly showCleanHistory!: boolean

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

  handleCloseClick (): void {
    this.$emit('close')
  }

  // handleCleanHistoryClick (): void {
  //   this.$emit('cleanHistory')
  // }
}
</script>

<style lang="scss">
.base {
  .el-loading-mask {
    background-color: var(--s-color-utility-surface);
  }
}
.base-title_tooltip-popper.neumorphic.info-tooltip {
  max-width: 165px;
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
    &_tooltip {
      margin-top: auto;
      margin-bottom: auto;
      margin-left: var(--s-basic-spacing);
      cursor: pointer;
    }
  }
}
</style>
