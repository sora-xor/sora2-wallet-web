import { gql } from '@urql/core';

import type { SubsquidAccountEntity, SubsquidSubscriptionResponse } from '../types';

export const AccountHistorySubscription = gql<SubsquidSubscriptionResponse<SubsquidAccountEntity>>`
  subscription SubsquidAccountHistorySubscription($id: [String!]) {
    nodes: accounts(where: { id_in: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
