import { gql } from '@urql/core';

import type { SubsquidAccountEntity, SubscriptionResponse } from '../types';

export const AccountHistorySubscription = gql<SubscriptionResponse<SubsquidAccountEntity>>`
  subscription SubsquidAccountHistorySubscription($id: [String!]) {
    nodes: accounts(where: { id_in: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
