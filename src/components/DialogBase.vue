<template>
  <s-dialog
    class="dialog-wrapper"
    :visible.sync="isVisible"
    :title="title"
    :custom-class="computedCustomClasses"
    :show-close="false"
    v-bind="{
      width,
      borderRadius: 'medium',
      ...$attrs,
    }"
    ref="dialog"
  >
    <template #title>
      <div v-if="showBack">
        <s-button type="action" @click="handleBackClick">
          <s-icon name="arrows-chevron-left-rounded-24" size="28" />
        </s-button>
      </div>
      <slot name="title">
        <span class="el-dialog__title">
          {{ title }}
          <s-tooltip
            v-if="tooltip"
            border-radius="mini"
            class="el-dialog__tooltip-icon"
            :content="tooltip"
            placement="top"
            tabindex="-1"
          >
            <s-icon name="info-16" size="18px" />
          </s-tooltip>
        </span>
      </slot>
      <slot v-if="showCloseButton" name="close">
        <s-button class="el-dialog__close" type="action" icon="x-16" @click="closeDialog" />
      </slot>
    </template>

    <div class="dialog-content">
      <slot />
    </div>

    <slot slot="footer" name="footer" />
  </s-dialog>
</template>

<script lang="ts">
import SScrollbar from '@soramitsu-ui/ui-vue2/lib/components/Scrollbar';
import Vue from 'vue';
import { Component, Mixins, Prop, Ref, Watch } from 'vue-property-decorator';

import DialogMixin from './mixins/DialogMixin';

import type SDialog from '@soramitsu-ui/ui-vue2/lib/components/Dialog/SDialog.vue';

@Component
export default class DialogBase extends Mixins(DialogMixin) {
  @Prop({ default: '', type: String }) readonly customClass!: string;
  @Prop({ default: '', type: String }) readonly title!: string;
  @Prop({ default: '', type: String }) readonly tooltip!: string;
  @Prop({ default: '', type: String }) readonly width!: string;
  @Prop({ default: false, type: Boolean }) readonly showBack!: boolean;
  @Prop({ default: true, type: Boolean }) readonly showCloseButton!: boolean;

  get computedCustomClasses(): string {
    const cssClasses: Array<string> = [];
    cssClasses.push('neumorphic');
    if (this.customClass) {
      cssClasses.push(this.customClass);
    }
    return cssClasses.join(' ');
  }

  async mounted(): Promise<void> {
    await this.$nextTick();
    this.addDialogScrollbar();
  }

  handleBackClick(): void {
    this.$emit('back');
  }

  /**
   * It's required cuz we've added scrollbar between dialog layers and default click outside directive doesn't work
   */
  private handleClickOutside(event: Event, el: Node): void {
    // IMPORTANT: If something was used with v-if and this node was removed -> dialog will be closed by default.
    // Need to stop event propagation in this case
    if (!(el === event.target || el.contains(event.target as Node)) && this.isVisible) {
      this.closeDialog();
    }
  }

  private addDialogScrollbar(): void {
    const dialogWrapper = this.$el;
    const dialog = this.$el.childNodes[0];
    const handleClickOutside = (event: Event) => this.handleClickOutside(event, dialog);
    // Create scrollbar component dinamically. It should be done in js-ui-library
    const Scrollbar = Vue.extend(SScrollbar);
    const scrollbar = new Scrollbar({
      mounted: function () {
        this.$el.addEventListener('mousedown', handleClickOutside);
      },
      destroyed: function () {
        this.$el.removeEventListener('mousedown', handleClickOutside);
      },
    });
    scrollbar.$mount();
    dialogWrapper.appendChild(scrollbar.$el);
    const scrollbarView = scrollbar.$el.getElementsByClassName('el-scrollbar__view')[0];
    scrollbarView.appendChild(dialog);
  }

  @Ref('dialog') readonly dialogCmp!: SDialog;

  @Watch('isVisible')
  private async onVisibilityUpdate(value: boolean) {
    // wait for vdom update (imported async components loading)
    await this.$nextTick();
    if (value) {
      this.createContentObserver();
    } else {
      this.destroyContentObserver();
    }
  }

  private contentObserver: ResizeObserver | null = null;

  private createContentObserver(): void {
    // $ref not working here, so dom search is used
    const content = this.$el.getElementsByClassName('dialog-content')[0];

    if (!content) return;

    this.contentObserver = new ResizeObserver(() => {
      this.dialogCmp.computeTop();
    });
    this.contentObserver.observe(content);
  }

  private destroyContentObserver(): void {
    this.contentObserver?.disconnect();
    this.contentObserver = null;
  }

  beforeDestroy() {
    this.destroyContentObserver();
  }
}
</script>

<style lang="scss">
$el-dialog-class: '.el-dialog';
$el-dialog-button-size: var(--s-size-medium);
$el-dialog-max-width: 496px;

.dialog-wrapper {
  @include scrollbar;

  > .el-scrollbar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0;

    > .el-scrollbar__wrap {
      overflow-x: hidden;
      overflow-y: scroll;
    }
  }

  #{$el-dialog-class} {
    background: var(--s-color-utility-surface);
    max-width: $el-dialog-max-width;
    width: 100%;

    & > #{$el-dialog-class} {
      &__header {
        padding: $basic-spacing-big $basic-spacing-big $basic-spacing;
      }
      &__body {
        padding: $basic-spacing $basic-spacing-big $basic-spacing-big;
      }
      &__footer {
        padding: $basic-spacing $basic-spacing-big $basic-spacing-big;
      }
    }

    #{$el-dialog-class}__header {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      #{$el-dialog-class}__title {
        font-size: var(--s-heading3-font-size);
        font-weight: 300 !important;
        line-height: var(--s-line-height-small);
        letter-spacing: var(--s-letter-spacing-mini);
      }

      #{$el-dialog-class}__tooltip-icon {
        margin-left: 4px;
        color: var(--s-color-base-content-tertiary);
        &:hover {
          cursor: pointer;
        }
      }

      #{$el-dialog-class}__close {
        i {
          font-size: var(--s-icon-font-size-big) !important;
        }
      }
    }

    #{$el-dialog-class}__footer {
      .el-button {
        padding: $basic-spacing;
        width: 100%;
      }
    }
  }
}
</style>
