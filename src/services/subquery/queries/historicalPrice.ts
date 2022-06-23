import { AssetSnapshotTypes } from '../types';

export const HistoricalPriceQuery = `
query HistoricalPriceQuery(
  $after: Cursor = ""
  $filter: AssetSnapshotFilter
  $first: Int = null
) {
  assetSnapshots(
    after: $after
    first: $first
    filter: $filter
    orderBy: [TIMESTAMP_DESC]
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      priceUSD
      volume
      timestamp
    }
  }
}
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
