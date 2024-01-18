import { gql } from '@urql/core';

import { UpdatesStream } from '../../types';

import type { SubquerySubscriptionPayload, SubqueryAssetEntityMutation, SubqueryPoolXYKEntityMutation } from '../types';
// [TODO] remove after prod-sub4 deprecation
export const FiatAssetsPriceSubscription = gql<SubquerySubscriptionPayload<SubqueryAssetEntityMutation>>`
  subscription SubqueryFiatAssetsPriceSubscription {
    payload: assets(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
// [TODO] remove after prod-sub4 deprecation
export const PoolsXYKApySubscription = gql<SubquerySubscriptionPayload<SubqueryPoolXYKEntityMutation>>`
  subscription SubqueryPoolsXYKApySubscription {
    payload: poolXYKs(mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const PriceStreamSubscription = gql<SubquerySubscriptionPayload<UpdatesStream>>`
  subscription SubqueryPriceStreamSubscription {
    payload: updatesStreams(id: "price", mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;

export const ApyStreamSubscription = gql<SubquerySubscriptionPayload<UpdatesStream>>`
  subscription SubqueryApyStreamSubscription {
    payload: updatesStreams(id: "apy", mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
