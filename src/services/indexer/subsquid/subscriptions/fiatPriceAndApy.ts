import { gql } from '@urql/core';

import type { SubscriptionPayload, UpdatesStream } from '../../types';

export const PriceStreamSubscription = gql<SubscriptionPayload<UpdatesStream>>`
  subscription SubsquidPriceStreamSubscription {
    payload: updatesStreamById(id: "price") {
      block
      data
    }
  }
`;

export const ApyStreamSubscription = gql<SubscriptionPayload<UpdatesStream>>`
  subscription SubsquidApyStreamSubscription {
    payload: updatesStreamById(id: "apy") {
      block
      data
    }
  }
`;
