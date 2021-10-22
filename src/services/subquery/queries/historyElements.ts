export const HistoryElementsQuery = `
query HistoryElements (
  $first: Int = null,
  $last: Int = null,
  $after: Cursor = "",
  $before: Cursor = "",
  $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC,
  $filter: HistoryElementFilter)
{
  historyElements (
    first: $first
    last: $last
    before: $before
    after: $after
    orderBy: $orderBy
    filter: $filter
  )
  {
    edges {
      cursor 
      node {
        id
        blockHash
        blockHeight
        module
        method
        address
        networkFee
        execution
        timestamp
        data
      }
    }
  }
}
`;

type AssetFilter = {
  data: {
    contains: {
      [key: string]: string;
    };
  };
};

const createAssetFilters = (assetAddress: string): Array<AssetFilter> => {
  const attributes = ['assetId', 'baseAssetId', 'targetAssetId'];

  return attributes.reduce((result: Array<AssetFilter>, attr) => {
    result.push({
      data: {
        contains: {
          [attr]: assetAddress,
        },
      },
    });

    return result;
  }, []);
};

export const historyElementsFilter = (address = '', { assetAddress = '', timestamp = 0 } = {}): any => {
  const filter: any = {
    and: [
      {
        method: {
          in: ['swap', 'transfer', 'depositLiquidity', 'withdrawLiquidity', 'register'],
        },
      },
    ],
  };

  if (address) {
    filter.and.push({
      or: [
        {
          address: {
            equalTo: address,
          },
        },
        {
          data: {
            contains: {
              to: address,
            },
          },
        },
      ],
    });
  }

  if (assetAddress) {
    filter.and.push({
      or: createAssetFilters(assetAddress),
    });
  }

  if (timestamp) {
    filter.and.push({
      timestamp: {
        greaterThan: String(timestamp),
      },
    });
  }

  return filter;
};
