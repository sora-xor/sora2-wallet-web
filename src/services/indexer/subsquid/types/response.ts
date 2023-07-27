import { ConnectionQueryResponseData } from '../../types';
import { SubsquidQueryResponseInfo } from './subsquid';

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
