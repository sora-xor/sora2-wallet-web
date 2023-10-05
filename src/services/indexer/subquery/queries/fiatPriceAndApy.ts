import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { SubqueryAssetEntity, SubqueryPoolXYKEntity, SubqueryConnectionQueryResponse } from '../types';

export const FiatPriceQuery = gql<SubqueryConnectionQueryResponse<SubqueryAssetEntity>>`
  query SubqueryFiatPriceQuery($after: Cursor = "", $first: Int = 100) {
    data: assets(first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          id
          priceUSD
        }
      }
    }
  }
  ${PageInfoFragment}
`;

export const ApyQuery = gql<SubqueryConnectionQueryResponse<SubqueryPoolXYKEntity>>`
  query SubqueryApyQuery($after: Cursor = "", $first: Int = 100) {
    data: poolXYKs(first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        id
        strategicBonusApy
      }
    }
  }
  ${PageInfoFragment}
`;
