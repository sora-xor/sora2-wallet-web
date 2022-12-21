import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import { AssetSnapshotTypes } from '../types';

import type { EntitiesQueryResponse, AssetSnapshotEntity } from '../types';

export const HistoricalPriceQuery = gql<EntitiesQueryResponse<AssetSnapshotEntity>>`
  query HistoricalPriceQuery($after: Cursor = "", $filter: AssetSnapshotFilter, $first: Int = null) {
    entities: assetSnapshots(after: $after, first: $first, filter: $filter, orderBy: [TIMESTAMP_DESC]) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        priceUSD
        volume
        timestamp
      }
    }
  }
  ${PageInfoFragment}
`;

export const historicalPriceFilter = (assetAddress: string, type: AssetSnapshotTypes) => {
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
