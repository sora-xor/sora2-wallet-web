import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { SubqueryAssetEntity, SubqueryPoolXYKEntity, SubqueryEntitiesQueryResponse } from '../types';

export const FiatPriceQuery = gql<SubqueryEntitiesQueryResponse<SubqueryAssetEntity>>`
  query SubqueryFiatPriceQuery($after: Cursor = "", $first: Int = 100) {
    entities: assets(first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        id
        priceUSD
      }
    }
  }
  ${PageInfoFragment}
`;

export const ApyQuery = gql<SubqueryEntitiesQueryResponse<SubqueryPoolXYKEntity>>`
  query SubqueryApyQuery($after: Cursor = "", $first: Int = 100) {
    entities: poolXYKs(first: $first, after: $after) {
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
