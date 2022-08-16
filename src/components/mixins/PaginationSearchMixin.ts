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

  resetPage(): void {
    this.currentPage = 1;
  }

  resetSearch(): void {
    this.query = '';
  }

  getPageItems(items: Array<any>, customStartIndex?: number, customLastIndex?: number): Array<any> {
    return items.slice(customStartIndex ?? this.startIndex, customLastIndex ?? this.lastIndex);
  }
}
