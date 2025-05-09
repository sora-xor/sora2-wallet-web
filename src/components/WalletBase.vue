<template>
  <s-card
    v-bind="{
      primary: true,
      borderRadius: 'medium',
      shadow: 'always',
      size: 'big',
      ...$attrs,
    }"
    class="base"
  >
    <template #header>
      <div :class="headerClasses" ref="headerBase" :tabindex="hasFocusReset ? 0 : -1">
        <div v-if="showBack" :class="backButtonClass">
          <s-button type="action" @click="handleBackClick">
            <s-icon name="arrows-chevron-left-rounded-24" size="28" />
          </s-button>
        </div>

        <h3 class="base-title_text" v-if="showHeader">
          {{ title }}
          <s-tooltip
            v-if="tooltip"
            class="base-title_tooltip"
            popper-class="info-tooltip base-title_tooltip-popper"
            border-radius="mini"
            :content="tooltip"
            placement="right"
            tabindex="-1"
          >
            <s-icon name="info-16" size="18px" />
          </s-tooltip>
        </h3>

        <div class="base-title_action">
          <slot name="actions" />
        </div>

        <s-button
          v-if="showClose"
          class="base-title_close"
          type="action"
          rounded
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
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';

@Component
export default class WalletBase extends Mixins(TranslationMixin) {
  @Prop({ default: '', type: String }) readonly title!: string;
  @Prop({ default: '', type: String }) readonly tooltip!: string;
  @Prop({ default: false, type: Boolean }) readonly titleCenter!: boolean;
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean;
  @Prop({ default: false, type: Boolean }) readonly showClose!: boolean;
  @Prop({ default: true, type: Boolean }) readonly showHeader!: boolean;
  @Prop({ default: '', type: String }) readonly resetFocus!: string;

  @Watch('resetFocus')
  private async resetBaseFocus(value: string) {
    if (value) {
      this.hasFocusReset = true;
      this.setFocusToHeader();
      this.hasFocusReset = false;
    }
  }

  setFocusToHeader() {
    const editButtonRef = this.$refs.headerBase as any;
    editButtonRef.focus();
    editButtonRef.blur();
  }

  hasFocusReset = false;

  get headerClasses(): Array<string> {
    const cssClasses: Array<string> = ['base-title', 's-flex'];
    if (this.showBack || this.titleCenter) {
      cssClasses.push('base-title--center');
    }
    if (this.showClose) {
      cssClasses.push('base-title--actions');
    }
    return cssClasses;
  }

  get backButtonClass(): Array<string> {
    const base = ['base-title_back'];
    if (!this.showBack) base.push('base-title_back--hidden');
    return base;
  }

  mounted(): void {
    this.setFocusToHeader();
  }

  handleBackClick(): void {
    this.$emit('back');
  }

  handleCloseClick(): void {
    this.$emit('close');
  }
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
  max-width: $wallet-width;
  width: 100%;
  font-size: var(--s-font-size-small);
  line-height: var(--s-line-height-base);

  &-title {
    position: relative;
    height: $button-size;
    align-items: center;
    padding-right: calc(#{$button-size} + #{$basic-spacing-medium});
    margin-bottom: #{$basic-spacing-medium};
    &_action {
      display: flex;
      align-items: flex-start;
    }
    &--center {
      padding-left: calc(#{$button-size} + #{$basic-spacing-medium});
      text-align: center;
    }
    &--has-history {
      .base-title_action {
        right: calc(var(--s-size-medium) + var(--s-basic-spacing));
      }
    }
    &--actions {
      padding-right: calc(#{$button-size} * 2 + #{$basic-spacing-medium});

      &.base-title--center {
        padding-left: calc(#{$button-size} * 2 + #{$basic-spacing-medium});
      }
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
      position: absolute;
      left: 0;

      &--hidden {
        display: none;
      }
    }
    &_action,
    &_trash,
    &_close {
      position: absolute;
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
