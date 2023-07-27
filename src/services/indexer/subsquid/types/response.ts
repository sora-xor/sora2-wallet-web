import { MutationTypes, SubsquidNodesConnection, SubsquidNodesConnectionInfo } from './subquery';

/* eslint-disable camelcase */
export type SubscriptionPayload<T> = {
  payload: {
    id: string;
    mutation_type: MutationTypes;
    _entity: T;
  };
};
/* eslint-enable camelcase */

export type SubscriptionResponse<T> = {
  nodes: T[];
};

export type NodesQueryResponse<T> = {
  nodes: T[];
  info: SubsquidNodesConnectionInfo;
};

export type EntitiesConnectionQueryResponse<T> = {
  entities: SubsquidNodesConnection<T>;
};
