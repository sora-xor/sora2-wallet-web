import { gql } from '@urql/core';

export const AccountHistorySubscription = gql`
  subscription AccountHistorySubscription($id: [ID!]) {
    accounts(id: $id, mutation: [UPDATE, INSERT]) {
      id
      mutation_type
      _entity
    }
  }
`;
