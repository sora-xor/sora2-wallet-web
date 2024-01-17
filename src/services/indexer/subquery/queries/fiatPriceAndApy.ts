import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type {
  SubqueryAssetEntity,
  SubqueryPoolXYKEntity,
  SubqueryQueryResponse,
  SubqueryConnectionQueryResponse,
  SubqueryStreamUpdate,
} from '../types';

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

export const FiatPriceStreamQuery = gql<SubqueryQueryResponse<SubqueryStreamUpdate>>`
  query SubqueryFiatPriceQuery {
    data: updatesStream(id: "price") {
      block
      data
    }
  }
`;

export const ApyQuery = gql<SubqueryConnectionQueryResponse<SubqueryPoolXYKEntity>>`
  query SubqueryApyQuery($after: Cursor = "", $first: Int = 100) {
    data: poolXYKs(first: $first, after: $after) {
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
