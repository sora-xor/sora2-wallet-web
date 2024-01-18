import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { SnapshotTypes, AssetSnapshotEntity } from '../types';

import type { ConnectionQueryResponse } from '../../types';

export const HistoricalPriceQuery = gql<ConnectionQueryResponse<AssetSnapshotEntity>>`
  query SubsquidHistoricalPriceQuery($after: String = null, $filter: AssetSnapshotWhereInput, $first: Int = null) {
    data: assetSnapshotsConnection(after: $after, first: $first, where: $filter, orderBy: [timestamp_DESC]) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          asset {
            id
          }
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
        asset: { id_eq: assetAddress },
      },
      {
        type_eq: type,
      },
    ],
  };
};
