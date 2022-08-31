import { gql } from '@urql/core';

import type { SubscriptionPayload, AccountEntity } from '../types';

export const AccountHistorySubscription = gql<{ accounts: SubscriptionPayload<AccountEntity> }>`
  subscription AccountHistorySubscription($id: [ID!]) {
    accounts(id: $id, mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
