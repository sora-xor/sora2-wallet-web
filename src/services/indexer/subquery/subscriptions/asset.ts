import { gql } from '@urql/core';

import type { SubquerySubscriptionPayload, SubqueryStreamUpdate } from '../types';

export const AssetRegisrationStreamSubscription = gql<SubquerySubscriptionPayload<SubqueryStreamUpdate>>`
  subscription SubqueryFiatStreamPriceSubscription {
    payload: updatesStreams(id: "assetRegistration", mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
