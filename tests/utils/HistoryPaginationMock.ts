interface HistoryPagination {
  title: string;
  currentPage: number;
  pageAmount: number;
  totalText: string;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export const MOCK_HISTORY_PAGINATION: Array<HistoryPagination> = [
  {
    title: 'With Empty History',
    currentPage: 1,
    pageAmount: 10,
    totalText: '0-0 of 0',
    isFirstPage: true,
    isLastPage: false,
  },
  {
    title: 'With Second Page',
    currentPage: 2,
    pageAmount: 10,
    totalText: '11-20 of 23',
    isFirstPage: false,
    isLastPage: false,
  },
  {
    title: 'With Last Page',
    currentPage: 2,
    pageAmount: 10,
    totalText: '11-11 of 11',
    isFirstPage: false,
    isLastPage: true,
  },
];
