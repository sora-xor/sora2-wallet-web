export enum SubqueryMutationTypes {
  DELETE = 'DELETE',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
}

export type SubqueryPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

export type SubqueryEdgeConnection<T> = {
  cursor: string;
  node: T;
};

export type SubqueryNodesConnection<T> = {
  nodes: T[];
  edges: SubqueryEdgeConnection<T>[];
  pageInfo: SubqueryPageInfo;
  totalCount: number;
};
