<template>
  <s-pagination class="history-pagination" layout="slot" :current-page.sync="currentPage" :page-size="pageAmount">
    <span class="el-pagination__total">{{ totalText }}</span>
    <s-button
      type="link"
      :tooltip="t('history.firstText')"
      :disabled="disabledFirstPrev"
      @click="handlePaginationClick(PaginationButton.First)"
    >
      <s-icon name="chevrons-left-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.prevText')"
      :disabled="disabledFirstPrev"
      @click="handlePaginationClick(PaginationButton.Prev)"
    >
      <s-icon name="chevron-left-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.nextText')"
      :disabled="disabledNextLast"
      @click="handlePaginationClick(PaginationButton.Next)"
    >
      <s-icon name="chevron-right-16" size="14" />
    </s-button>
    <s-button
      type="link"
      :tooltip="t('history.lastText')"
      :disabled="disabledNextLast"
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
  @Prop({ default: 0, type: Number }) readonly total!: number;
  @Prop({ default: false, type: Boolean }) readonly loading?: boolean;
  @Prop({ default: 1, type: Number }) readonly lastPage!: number;

  readonly PaginationButton = PaginationButton;

  get totalText(): string {
    const upperNumber = this.pageAmount * this.currentPage;

    return `${this.t('ofText', {
      first: `${upperNumber - this.pageAmount + 1}-${upperNumber > this.total ? this.total : upperNumber}`,
      second: this.total,
    })}`;
  }

  /** Disable First, Prev buttons if this is the first page or loading state */
  get disabledFirstPrev(): boolean {
    return this.currentPage === 1 || !!this.loading;
  }

  /** Disable Next, Last buttons if this is the last page or loading state */
  get disabledNextLast(): boolean {
    return this.currentPage === this.lastPage || !!this.loading;
  }

  handlePaginationClick(button: PaginationButton): void {
    this.$emit('pagination-click', button);
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
