export enum MutationTypes {
  DELETE = 'DELETE',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
}

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

export type EdgeConnection<T> = {
  cursor: string;
  node: T;
};

export type NodesConnection<T> = {
  edges: EdgeConnection<T>[];
  pageInfo: PageInfo;
  totalCount: number;
};
