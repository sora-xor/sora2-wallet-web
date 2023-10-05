export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

export type Edge<T> = {
  cursor: string;
  node: T;
};

export type QueryResponseData<T> = {
  nodes: T[];
  totalCount: number;
};

export type ConnectionQueryResponseData<T> = {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
};
