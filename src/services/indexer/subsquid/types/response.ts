export type SubsquidQueryResponseInfo = {
  totalCount: number;
};

export type SubsquidQueryResponse<T> = {
  nodes: T[];
  info: SubsquidQueryResponseInfo;
};

export type SubsquidSubscriptionResponse<T> = {
  nodes: T[];
};
