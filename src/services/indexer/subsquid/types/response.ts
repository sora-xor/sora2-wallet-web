import { ConnectionQueryResponseData } from '../../types';

export type SubsquidQueryResponseInfo = {
  totalCount: number;
};

export type SubsquidQueryResponse<T> = {
  nodes: T[];
  info: SubsquidQueryResponseInfo;
};

export type SubsquidConnectionQueryResponse<T> = {
  data: ConnectionQueryResponseData<T>;
};

export type SubsquidSubscriptionResponse<T> = {
  nodes: T[];
};
