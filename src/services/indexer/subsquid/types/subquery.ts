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

export type SubsquidEdgeConnection<T> = {
  cursor: string;
  node: T;
};

export type SubsquidNodesConnectionInfo = {
  totalCount: number;
};

export type SubsquidNodesConnection<T> = {
  edges: SubsquidEdgeConnection<T>[];
  pageInfo: PageInfo;
  totalCount: number;
};
