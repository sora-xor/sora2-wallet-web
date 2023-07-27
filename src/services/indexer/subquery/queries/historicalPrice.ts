import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import { SubquerySnapshotTypes } from '../types';

import type { SubqueryEntitiesQueryResponse, SubqueryAssetSnapshotEntity } from '../types';

export const HistoricalPriceQuery = gql<SubqueryEntitiesQueryResponse<SubqueryAssetSnapshotEntity>>`
  query SubqueryHistoricalPriceQuery($after: Cursor = "", $filter: AssetSnapshotFilter, $first: Int = null) {
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

export const historicalPriceFilter = (assetAddress: string, type: SubquerySnapshotTypes) => {
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
