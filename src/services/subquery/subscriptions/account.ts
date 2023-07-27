import { gql } from '@urql/core';

import type { AccountEntity, SubscriptionResponse } from '../types';

export const AccountHistorySubscription = gql<SubscriptionResponse<AccountEntity>>`
  subscription AccountHistorySubscription($id: [ID!]) {
    entities: accounts(where: { id_eq: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
