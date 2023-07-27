import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import { SnapshotTypes } from '../types';

import type { SubqueryConnectionQueryResponse, SubqueryAssetSnapshotEntity } from '../types';

export const HistoricalPriceQuery = gql<SubqueryConnectionQueryResponse<SubqueryAssetSnapshotEntity>>`
  query SubqueryHistoricalPriceQuery($after: Cursor = "", $filter: AssetSnapshotFilter, $first: Int = null) {
    data: assetSnapshots(after: $after, first: $first, filter: $filter, orderBy: [TIMESTAMP_DESC]) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
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
