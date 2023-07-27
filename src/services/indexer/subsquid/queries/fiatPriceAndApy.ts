import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { SubsquidAssetEntity, SubsquidPoolXYKEntity, SubsquidConnectionQueryResponse } from '../types';

export const FiatPriceQuery = gql<SubsquidConnectionQueryResponse<SubsquidAssetEntity>>`
  query SubsquidFiatPriceQuery($after: String = null, $first: Int = 100) {
    data: assetsConnection(orderBy: id_ASC, first: $first, after: $after) {
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

export const ApyQuery = gql<SubsquidConnectionQueryResponse<SubsquidPoolXYKEntity>>`
  query SubsquidApyQuery($after: String = null, $first: Int = 100) {
    data: poolXyksConnection(orderBy: id_ASC, first: $first, after: $after) {
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
