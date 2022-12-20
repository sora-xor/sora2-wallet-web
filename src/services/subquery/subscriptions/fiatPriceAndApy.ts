import { gql } from '@urql/core';

import type { SubscriptionPayload, AssetEntity, PoolXYKEntity } from '../types';

export const FiatPriceSubscription = gql<{ assets: SubscriptionPayload<AssetEntity> }>`
  subscription {
    assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsApySubscription = gql<{ poolXYKs: SubscriptionPayload<PoolXYKEntity> }>`
  subscription {
    poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
