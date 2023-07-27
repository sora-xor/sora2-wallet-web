import { MutationTypes, NodesConnection, NodesConnectionInfo } from './subquery';

/* eslint-disable camelcase */
export type SubscriptionPayload<T> = {
  payload: {
    id: string;
    mutation_type: MutationTypes;
    _entity: T;
  };
};
/* eslint-enable camelcase */

export type NodesQueryResponse<T> = {
  nodes: T[];
  info: NodesConnectionInfo;
};

export type EntitiesConnectionQueryResponse<T> = {
  entities: NodesConnection<T>;
};
