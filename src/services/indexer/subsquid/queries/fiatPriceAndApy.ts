import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { SubsquidAssetEntity, SubsquidPoolXYKEntity, EntitiesConnectionQueryResponse } from '../types';

export const FiatPriceQuery = gql<EntitiesConnectionQueryResponse<SubsquidAssetEntity>>`
  query SubsquidFiatPriceQuery($after: String = null, $first: Int = 100) {
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

export const ApyQuery = gql<EntitiesConnectionQueryResponse<SubsquidPoolXYKEntity>>`
  query SubsquidApyQuery($after: String = null, $first: Int = 100) {
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
