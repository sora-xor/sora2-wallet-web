import { gql } from '@urql/core';

import type {
  SubquerySubscriptionPayload,
  SubqueryStreamUpdate,
  SubqueryAssetEntityMutation,
  SubqueryPoolXYKEntityMutation,
} from '../types';

export const FiatPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryAssetEntityMutation>>`
  subscription SubqueryFiatPriceSubscription {
    payload: assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PoolsApySubscription = gql<SubquerySubscriptionPayload<SubqueryPoolXYKEntityMutation>>`
  subscription SubqueryPoolsApySubscription {
    payload: poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

// export const FiatPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryStreamUpdate>>`
//   subscription SubqueryFiatPriceSubscription {
//     payload: updatesStreams(id: "price", mutation: [UPDATE, INSERT]) {
//       id
//       mutation_type
//       _entity
//     }
//   }
// `;

// export const PoolsApySubscription = gql<SubquerySubscriptionPayload<SubqueryStreamUpdate>>`
//   subscription SubqueryPoolsApySubscription {
//     payload: updatesStreams(id: "apy", mutation: [UPDATE, INSERT]) {
//       id
//       mutation_type
//       _entity
//     }
//   }
// `;
