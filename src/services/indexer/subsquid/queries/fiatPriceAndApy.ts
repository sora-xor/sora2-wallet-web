import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { QueryData, ConnectionQueryResponse, UpdatesStream } from '../../types';
import type { SubsquidAssetEntity, SubsquidPoolXYKEntity } from '../types';

export const FiatPriceQuery = gql<ConnectionQueryResponse<SubsquidAssetEntity>>`
  query SubsquidFiatPriceQuery($after: String = null, $first: Int = 100) {
    data: assetsConnection(orderBy: id_ASC, first: $first, after: $after, where: { priceUSD_gt: "0" }) {
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

export const FiatPriceStreamQuery = gql<QueryData<UpdatesStream>>`
  query SubsquidFiatPriceStreamQuery {
    data: updatesStreamById(id: "price") {
      block
      data
    }
  }
`;

export const ApyQuery = gql<ConnectionQueryResponse<SubsquidPoolXYKEntity>>`
  query SubsquidApyQuery($after: String = null, $first: Int = 100) {
    data: poolXyksConnection(orderBy: id_ASC, first: $first, after: $after, where: { strategicBonusApy_gt: "0" }) {
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
