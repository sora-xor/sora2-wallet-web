import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { SnapshotTypes, AssetSnapshotEntity } from '../types';

import type { SubqueryConnectionQueryResponse } from '../types';

export const HistoricalPriceQuery = gql<SubqueryConnectionQueryResponse<AssetSnapshotEntity>>`
  query SubqueryHistoricalPriceQuery($after: Cursor = "", $filter: AssetSnapshotFilter, $first: Int = null) {
    data: assetSnapshots(after: $after, first: $first, filter: $filter, orderBy: [TIMESTAMP_DESC]) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          assetId
          priceUSD
          volume
          timestamp
        }
      }
    }
  }
  ${PageInfoFragment}
`;

export const historicalPriceFilter = (assetAddress: string, type: SnapshotTypes) => {
  return {
    and: [
      {
        assetId: {
          equalTo: assetAddress,
        },
      },
      {
        type: {
          equalTo: type,
        },
      },
    ],
  };
};
