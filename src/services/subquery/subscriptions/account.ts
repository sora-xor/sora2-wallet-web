import { gql } from '@urql/core';

import type { SubscriptionPayload, AccountEntity } from '../types';

export const AccountHistorySubscription = gql<SubscriptionPayload<AccountEntity>>`
  subscription AccountHistorySubscription($id: [ID!]) {
    payload: accounts(where: { id_eq: $id }) {
      id
      latestHistoryElement {
        id
      }
    }
  }
`;
