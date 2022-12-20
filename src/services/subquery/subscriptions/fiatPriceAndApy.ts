import { gql } from '@urql/core';

import type { SubscriptionPayload, AssetEntity } from '../types';

export const FiatPriceSubscription = gql<{ assets: SubscriptionPayload<AssetEntity> }>`
  subscription {
    assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
