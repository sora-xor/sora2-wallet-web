<template>
  <s-dialog
    :visible.sync="isVisible"
    :title="title"
    :custom-class="computedCustomClasses"
    :show-close="false"
    :top="top"
    v-bind="{
      width,
      borderRadius: 'medium',
      ...$attrs,
    }"
    class="dialog-wrapper"
  >
    <template #title>
      <slot name="title">
        <span class="el-dialog__title">{{ title }}</span>
      </slot>
      <slot v-if="showCloseButton" name="close">
        <s-button class="el-dialog__close" type="action" icon="x-16" @click="closeDialog" />
      </slot>
    </template>
    <slot />
    <!-- <slot slot="footer" name="footer" /> -->
  </s-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';

import DialogMixin from '@/components/mixins/DialogMixin';

@Component
export default class DialogBase extends Mixins(DialogMixin) {
  @Prop({ default: '', type: String }) readonly customClass!: string;
  @Prop({ default: '', type: String }) readonly title!: string;
  @Prop({ default: '', type: String }) readonly width!: string;
  @Prop({ default: true, type: Boolean }) readonly showCloseButton!: boolean;
  @Prop({ default: '15vh', type: String }) readonly top!: string;

  get computedCustomClasses(): string {
    const cssClasses: Array<string> = [];
    cssClasses.push('neumorphic');
    if (this.customClass) {
      cssClasses.push(this.customClass);
    }
    return cssClasses.join(' ');
  }
}
</script>

<style lang="scss">
$el-dialog-class: '.el-dialog';
$el-dialog-button-size: var(--s-size-medium);
$el-dialog-max-width: 496px;
$inner-spacing-mini: 8px;
$inner-spacing-big: $inner-spacing-mini * 3;

.dialog-wrapper {
  #{$el-dialog-class} {
    background: var(--s-color-utility-surface);
    max-width: $el-dialog-max-width;
    width: 100%;

    & > #{$el-dialog-class} {
      &__body {
        padding: $inner-spacing-mini $inner-spacing-big;
      }
    }

    #{$el-dialog-class}__header {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      display: none;

      #{$el-dialog-class}__title {
        font-size: var(--s-heading3-font-size);
        font-weight: 300 !important;
        line-height: var(--s-line-height-small);
        letter-spacing: var(--s-letter-spacing-mini);
      }

      #{$el-dialog-class}__close {
        i {
          font-size: var(--s-icon-font-size-big) !important;
        }
      }
    }

    #{$el-dialog-class}__footer {
      .el-button {
        padding: $inner-spacing-mini;
        width: 100%;
      }
    }
  }
}
</style>
