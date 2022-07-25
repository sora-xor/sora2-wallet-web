import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

export const FiatPriceQuery = gql`
  query FiatPriceQuery($after: Cursor = "", $first: Int = 100) {
    poolXYKs(first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        id
        priceUSD
        strategicBonusApy
      }
    }
  }
  ${PageInfoFragment}
`;

export const FiatPriceSubscription = gql`
  subscription {
    poolXYKs {
      id
      mutation_type
      _entity
    }
  }
`;
