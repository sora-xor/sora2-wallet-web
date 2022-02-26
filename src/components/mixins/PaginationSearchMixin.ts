import { Component, Vue } from 'vue-property-decorator';

@Component
export default class PaginationSearchMixin extends Vue {
  currentPage = 1;
  pageAmount = 10;
  query = '';

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageAmount;
  }

  get lastIndex(): number {
    return this.currentPage * this.pageAmount;
  }

  get searchQuery(): string {
    return this.query.trim();
  }

  handlePrevClick(current: number): void {
    this.currentPage = current;
  }

  handleNextClick(current: number): void {
    this.currentPage = current;
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  resetSearch(): void {
    this.query = '';
  }

  getPageItems(items: Array<any>): Array<any> {
    return items.slice(this.startIndex, this.lastIndex);
  }
}
