<template>
  <s-pagination
    class="history-pagination"
    layout="slot"
    :current-page.sync="currentPage"
    :page-size="pageAmount"
    :total-text="totalText"
  >
    <span class="el-pagination__total">{{ totalText }}</span>
    <s-button
      type="link"
      :tooltip="t('history.firstText')"
      :disabled="isFirstPage"
      @click="handlePaginationClick(PaginationButton.First)"
    >
      <s-icon name="chevrons-left-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.prevText')"
      :disabled="isFirstPage"
      @click="handlePaginationClick(PaginationButton.Prev)"
    >
      <s-icon name="chevron-left-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.nextText')"
      :disabled="isLastPage"
      @click="handlePaginationClick(PaginationButton.Next)"
    >
      <s-icon name="chevron-right-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.lastText')"
      :disabled="isLastPage"
      @click="handlePaginationClick(PaginationButton.Last)"
    >
      <s-icon name="chevrons-right-16" size="14" />
    </s-button>
  </s-pagination>
</template>

<script lang="ts">
import { Mixins, Component, Prop } from 'vue-property-decorator';

import TranslationMixin from './mixins/TranslationMixin';
import { PaginationButton } from '../consts';

@Component
export default class HistoryPagination extends Mixins(TranslationMixin) {
  @Prop({ default: 1, type: Number }) readonly currentPage!: number;
  @Prop({ default: 10, type: Number }) readonly pageAmount!: number;
  @Prop({ default: 'Total', type: String }) readonly totalText!: string;
  @Prop({ default: false, type: Boolean }) readonly isFirstPage!: boolean;
  @Prop({ default: false, type: Boolean }) readonly isLastPage!: boolean;

  readonly PaginationButton = PaginationButton;

  handlePaginationClick(button: PaginationButton): void {
    this.$emit('handle-pagination-click', button);
  }
}
</script>

<style lang="scss">
.history-pagination.el-pagination {
  margin-top: #{$basic-spacing-medium};
  display: flex;
  justify-content: end;
  align-items: baseline;
  padding-left: 0;
  padding-right: 0;
  .el-pagination__total {
    margin-right: auto;
    letter-spacing: var(--s-letter-spacing-small);
    color: var(--s-color-base-content-secondary);
  }
  .el-button.neumorphic {
    margin-left: 0;
    height: var(--s-small-medium);
    padding: 0;
    &:not(:hover):not(:active) {
      color: var(--s-color-base-content-tertiary);
    }
    span {
      min-width: calc(var(--s-basic-spacing) * 2.5);
    }
  }
}
</style>
