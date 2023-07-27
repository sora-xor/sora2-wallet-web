import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { AssetEntity, PoolXYKEntity, EntitiesQueryResponse } from '../types';

export const FiatPriceQuery = gql<EntitiesQueryResponse<AssetEntity>>`
  query FiatPriceQuery($after: String = null, $first: Int = 100) {
    entities: assetsConnection(orderBy: id_ASC, first: $first, after: $after) {
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

export const ApyQuery = gql<EntitiesQueryResponse<PoolXYKEntity>>`
  query ApyQuery($after: String = null, $first: Int = 100) {
    entities: poolXyksConnection(orderBy: id_ASC, first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          id
          strategicBonusApy
        }
      }
    }
  }
  ${PageInfoFragment}
`;
