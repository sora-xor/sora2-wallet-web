import { gql } from '@urql/core';

import type { AccountEntity, SubscriptionResponse } from '../types';

export const AccountHistorySubscription = gql<SubscriptionResponse<AccountEntity>>`
  subscription AccountHistorySubscription($id: [String!]) {
    nodes: accounts(where: { id_in: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
