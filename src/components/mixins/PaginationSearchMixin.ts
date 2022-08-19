import { Component, Mixins } from 'vue-property-decorator';

import LoadingMixin from './LoadingMixin';
import TranslationMixin from './TranslationMixin';

@Component
export default class PaginationSearchMixin extends Mixins(LoadingMixin, TranslationMixin) {
  currentPage = 1;
  pageAmount = 10;
  query = '';
  /** Change pagination number from left to right */
  isLtrDirection = true;

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageAmount;
  }

  get lastIndex(): number {
    return this.currentPage * this.pageAmount;
  }

  get searchQuery(): string {
    return this.query.trim();
  }

  get total(): number {
    return 0;
  }

  get totalText(): string {
    const upperNumber = this.pageAmount * this.currentPage;

    return `${this.t('ofText', {
      first: `${upperNumber - this.pageAmount + 1}-${upperNumber > this.total ? this.total : upperNumber}`,
      second: this.total,
    })}`;
  }

  get isFirstPage(): boolean {
    return this.currentPage === 1 || this.loading;
  }

  get lastPage(): number {
    return this.total ? Math.ceil(this.total / this.pageAmount) : 1;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.lastPage || this.loading;
  }

  get lastPageAmount(): number {
    return this.total % this.pageAmount || this.pageAmount;
  }

  get directionShift(): number {
    return this.isLtrDirection ? 0 : this.pageAmount - this.lastPageAmount;
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  resetSearch(): void {
    this.query = '';
  }

  sortTransactions(transactions: Array<any>, isAscendingOrder = false): Array<any> {
    return transactions.sort((a: any, b: any) =>
      a.startTime && b.startTime ? (isAscendingOrder ? b.startTime - a.startTime : a.startTime - b.startTime) : 0
    );
  }

  getPageItems(items: Array<any>, customStartIndex?: number, customLastIndex?: number): Array<any> {
    return items.slice(customStartIndex ?? this.startIndex, customLastIndex ?? this.lastIndex);
  }

  handlePrevClick(current: number): void {
    this.currentPage = current;
  }

  handleNextClick(current: number): void {
    this.currentPage = current;
  }
}
