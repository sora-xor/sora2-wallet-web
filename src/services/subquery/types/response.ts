import { MutationTypes, NodesConnection } from './subquery';

/* eslint-disable camelcase */
export type SubscriptionPayload<T> = {
  payload: {
    id: string;
    mutation_type: MutationTypes;
    _entity: T;
  };
};
/* eslint-enable camelcase */

export type EntitiesQueryResponse<T> = {
  entities: NodesConnection<T>;
};
