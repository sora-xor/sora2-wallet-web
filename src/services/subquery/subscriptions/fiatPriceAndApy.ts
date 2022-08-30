import { gql } from '@urql/core';

import type { SubscriptionPayload, SubscriptionResult, PoolXYKEntity } from '../types';

export type FiatPriceSubscriptionResult = SubscriptionResult<{ poolXYKs: SubscriptionPayload<PoolXYKEntity> }>;

export const FiatPriceSubscription = gql<FiatPriceSubscriptionResult>`
  subscription {
    poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
