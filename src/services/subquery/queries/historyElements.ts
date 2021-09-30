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
        blockHeight
        module
        method
        address
        networkFee
        success
        timestamp
        swap
        transfer
        irohaMigration
        liquidityOperation
      }
    }
  }
}
`;

const createAssetFilters = (assetAddress: string): Array<any> =>
  ['swap', 'transfer', 'liquidityOperation'].reduce<any[]>((result, method) => {
    const attributes = method === 'transfer' ? ['assetId'] : ['baseAssetId', 'targetAssetId'];
    attributes.forEach((attr) => {
      result.push({
        [method]: {
          contains: {
            [attr]: assetAddress,
          },
        },
      });
    });
    return result;
  }, []);

export const historyElementsFilter = (address: string, { assetAddress = '', timestamp = 0 }): any => {
  const filter: any = {
    and: [
      {
        or: [
          {
            address: {
              equalTo: address,
            },
          },
          {
            transfer: {
              contains: {
                to: address,
              },
            },
          },
        ],
      },
      {
        method: {
          in: ['swap', 'transfer', 'depositLiquidity', 'withdrawLiquidity'],
        },
      },
    ],
  };

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
