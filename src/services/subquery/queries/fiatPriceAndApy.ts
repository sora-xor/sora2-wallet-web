import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { AssetEntity, PoolXYKEntity, EntitiesQueryResponse } from '../types';

export const FiatPriceQuery = gql<EntitiesQueryResponse<AssetEntity>>`
  query FiatPriceQuery($after: Cursor = "", $first: Int = 100) {
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

export const ApyQuery = gql<EntitiesQueryResponse<PoolXYKEntity>>`
  query ApyQuery($after: Cursor = "", $first: Int = 100) {
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
