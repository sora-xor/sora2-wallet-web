import { gql } from '@urql/core';

import type { SubscriptionPayload, PoolXYKEntity } from '../types';

export const FiatPriceSubscription = gql<{ poolXYKs: SubscriptionPayload<PoolXYKEntity> }>`
  subscription {
    poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
