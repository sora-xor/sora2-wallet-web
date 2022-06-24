import { gql } from '@urql/core';

export const FiatPriceQuery = gql`
  query AssetsFiatPrices($after: Cursor = "", $first: Int = 100) {
    poolXYKs(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        priceUSD
        strategicBonusApy
      }
    }
  }
`;
