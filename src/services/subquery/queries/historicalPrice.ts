import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { SnapshotTypes } from '../types';

import type { EntitiesQueryResponse, AssetSnapshotEntity } from '../types';

export const HistoricalPriceQuery = gql<EntitiesQueryResponse<AssetSnapshotEntity>>`
  query HistoricalPriceQuery($after: String = null, $filter: AssetSnapshotWhereInput, $first: Int = null) {
    entities: assetSnapshotsConnection(after: $after, first: $first, where: $filter, orderBy: [timestamp_DESC]) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          priceUSD {
            close
            high
            low
            open
          }
          volume {
            amount
            amountUSD
          }
          timestamp
        }
      }
    }
  }
  ${PageInfoFragment}
`;

export const historicalPriceFilter = (assetAddress: string, type: SnapshotTypes) => {
  return {
    AND: [
      {
        assetId_eq: assetAddress,
      },
      {
        type_eq: type,
      },
    ],
  };
};
