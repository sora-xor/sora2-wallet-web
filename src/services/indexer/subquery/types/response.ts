import { SubqueryMutationTypes } from './subquery';

import type { SubscriptionPayload } from '../../types';

/* eslint-disable camelcase */
export type SubquerySubscriptionPayload<T> = SubscriptionPayload<{
  id: string;
  mutation_type: SubqueryMutationTypes;
  _entity: T;
}>;
/* eslint-enable camelcase */
