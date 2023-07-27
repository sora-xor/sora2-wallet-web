import { gql } from '@urql/core';

import type { SubquerySubscriptionPayload, SubqueryAccountEntity } from '../types';

export const AccountHistorySubscription = gql<SubquerySubscriptionPayload<SubqueryAccountEntity>>`
  subscription SubqueryAccountHistorySubscription($id: [ID!]) {
    payload: accounts(id: $id, mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
