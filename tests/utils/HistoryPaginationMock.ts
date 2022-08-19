interface HistoryPagination {
  title: string;
  currentPage: number;
  pageAmount: number;
  total: number;
  loading?: boolean;
  lastPage: number;
}

export const MOCK_HISTORY_PAGINATION: Array<HistoryPagination> = [
  {
    title: 'With Empty History',
    currentPage: 1,
    pageAmount: 10,
    total: 0,
    lastPage: 1,
  },
  {
    title: 'With Second Page',
    currentPage: 2,
    pageAmount: 10,
    total: 25,
    lastPage: 3,
  },
  {
    title: 'With Loading State',
    currentPage: 2,
    pageAmount: 10,
    total: 25,
    loading: true,
    lastPage: 3,
  },
  {
    title: 'With Last Page',
    currentPage: 2,
    pageAmount: 10,
    total: 11,
    lastPage: 2,
  },
];
