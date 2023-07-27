import { ConnectionQueryResponseData } from '../../types';

import { SubqueryMutationTypes } from './subquery';

/* eslint-disable camelcase */
export type SubquerySubscriptionPayload<T> = {
  payload: {
    id: string;
    mutation_type: SubqueryMutationTypes;
    _entity: T;
  };
};
/* eslint-enable camelcase */

export type SubqueryConnectionQueryResponse<T> = {
  data: ConnectionQueryResponseData<T>;
};
