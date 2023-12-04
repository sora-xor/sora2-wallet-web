import { gql } from '@urql/core';

import type {
  SubquerySubscriptionPayload,
  SubqueryStreamUpdate,
  SubqueryAssetEntityMutation,
  SubqueryPoolXYKEntityMutation,
} from '../types';

export const FiatAssetsPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryAssetEntityMutation>>`
  subscription SubqueryFiatAssetsPriceSubscription {
    payload: assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsXYKApySubscription = gql<SubquerySubscriptionPayload<SubqueryPoolXYKEntityMutation>>`
  subscription SubqueryPoolsXYKApySubscription {
    payload: poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const FiatStreamPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryStreamUpdate>>`
  subscription SubqueryFiatStreamPriceSubscription {
    payload: updatesStreams(id: "price", mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsStreamApySubscription = gql<SubquerySubscriptionPayload<SubqueryStreamUpdate>>`
  subscription SubqueryPoolsApySubscription {
    payload: updatesStreams(id: "apy", mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
