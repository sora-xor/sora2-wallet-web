import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { SubsquidSnapshotTypes } from '../types';

import type { EntitiesConnectionQueryResponse, SubsquidAssetSnapshotEntity } from '../types';

export const HistoricalPriceQuery = gql<EntitiesConnectionQueryResponse<SubsquidAssetSnapshotEntity>>`
  query SubsquidHistoricalPriceQuery($after: String = null, $filter: AssetSnapshotWhereInput, $first: Int = null) {
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

export const historicalPriceFilter = (assetAddress: string, type: SubsquidSnapshotTypes) => {
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
