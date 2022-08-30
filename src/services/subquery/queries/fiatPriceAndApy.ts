import { gql } from '@urql/core';

import type { ResultOf } from '../client';
import type { PoolXYKEntity } from '../types';

import { PageInfoFragment } from '../fragments/pageInfo';

type FiatPriceQueryResponse = {
  poolXYKs: {
    pageInfo: ResultOf<typeof PageInfoFragment>;
    nodes: PoolXYKEntity[];
  };
};

export const FiatPriceQuery = gql<FiatPriceQueryResponse>`
  query FiatPriceQuery($after: Cursor = "", $first: Int = 100) {
    poolXYKs(first: $first, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        id
        priceUSD
        strategicBonusApy
      }
    }
  }
  ${PageInfoFragment}
`;
