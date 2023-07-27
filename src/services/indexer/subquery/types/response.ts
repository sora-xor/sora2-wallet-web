import { SubqueryMutationTypes, SubqueryNodesConnection } from './subquery';

/* eslint-disable camelcase */
export type SubquerySubscriptionPayload<T> = {
  payload: {
    id: string;
    mutation_type: SubqueryMutationTypes;
    _entity: T;
  };
};
/* eslint-enable camelcase */

export type SubqueryEntitiesQueryResponse<T> = {
  entities: SubqueryNodesConnection<T>;
};
