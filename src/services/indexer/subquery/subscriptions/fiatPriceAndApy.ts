import { gql } from '@urql/core';

import type { SubquerySubscriptionPayload, SubqueryAssetEntity, SubqueryPoolXYKEntity } from '../types';

export const FiatPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryAssetEntity>>`
  subscription SubqueryFiatPriceSubscription {
    payload: assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsApySubscription = gql<SubquerySubscriptionPayload<SubqueryPoolXYKEntity>>`
  subscription SubqueryPoolsApySubscription {
    payload: poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
