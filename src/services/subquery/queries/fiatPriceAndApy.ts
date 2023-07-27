import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { AssetEntity, PoolXYKEntity, EntitiesConnectionQueryResponse } from '../types';

export const FiatPriceQuery = gql<EntitiesConnectionQueryResponse<AssetEntity>>`
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

export const ApyQuery = gql<EntitiesConnectionQueryResponse<PoolXYKEntity>>`
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
