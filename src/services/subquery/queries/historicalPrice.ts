import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import { AssetSnapshotTypes } from '../types';

export const HistoricalPriceQuery = gql`
  query HistoricalPriceQuery($after: Cursor = "", $filter: AssetSnapshotFilter, $first: Int = null) {
    assetSnapshots(after: $after, first: $first, filter: $filter, orderBy: [TIMESTAMP_DESC]) {
      totalCount
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
