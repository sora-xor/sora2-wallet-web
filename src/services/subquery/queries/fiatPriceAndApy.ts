import { gql } from '@urql/core';

import type { ResultOf } from '../client';
import type { AssetEntity, PoolXYKEntity } from '../types';

import { PageInfoFragment } from '../fragments/pageInfo';

type FiatPriceQueryResponse = {
  assets: {
    pageInfo: ResultOf<typeof PageInfoFragment>;
    nodes: AssetEntity[];
  };
};

type ApyQueryResponse = {
  poolXYKs: {
    pageInfo: ResultOf<typeof PageInfoFragment>;
    nodes: PoolXYKEntity[];
  };
};

export const FiatPriceQuery = gql<FiatPriceQueryResponse>`
  query FiatPriceQuery($after: Cursor = "", $first: Int = 100) {
    assets(first: $first, after: $after) {
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

export const ApyQuery = gql<ApyQueryResponse>`
  query ApyQuery($after: Cursor = "", $first: Int = 100) {
    poolXYKs(first: $first, after: $after) {
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
