import { gql } from '@urql/core';

import type { SubsquidAccountEntityMutation, SubsquidSubscriptionResponse } from '../types';

export const AccountHistorySubscription = gql<SubsquidSubscriptionResponse<SubsquidAccountEntityMutation>>`
  subscription SubsquidAccountHistorySubscription($id: [String!]) {
    nodes: accounts(where: { id_in: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
