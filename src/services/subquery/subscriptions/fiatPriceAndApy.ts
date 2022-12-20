import { gql } from '@urql/core';

import type { SubscriptionPayload, AssetEntity, PoolXYKEntity } from '../types';

export const FiatPriceSubscription = gql<SubscriptionPayload<AssetEntity>>`
  subscription {
    payload: assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsApySubscription = gql<SubscriptionPayload<PoolXYKEntity>>`
  subscription {
    payload: poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
