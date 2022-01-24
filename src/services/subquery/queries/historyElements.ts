import { ModuleNames, ModuleMethods } from '../../types';

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
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
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

const createOperationsFilter = () => {
  return {
    or: [
      {
        module: {
          equalTo: ModuleNames.LiquidityProxy,
        },
        method: {
          equalTo: ModuleMethods.LiquidityProxySwap,
        },
      },
      {
        module: {
          equalTo: ModuleNames.Assets,
        },
        method: {
          in: [ModuleMethods.AssetsTransfer, ModuleMethods.AssetsRegister],
        },
      },
      {
        module: {
          equalTo: ModuleNames.PoolXYK,
        },
        method: {
          in: [ModuleMethods.PoolXYKDepositLiquidity, ModuleMethods.PoolXYKWithdrawLiquidity],
        },
      },
      {
        module: {
          equalTo: ModuleNames.Utility,
        },
        method: {
          equalTo: ModuleMethods.UtilityBatchAll,
        },
      },
    ],
  };
};

export const historyElementsFilter = (address = '', { assetAddress = '', timestamp = 0 } = {}): any => {
  const filter: any = {
    and: [createOperationsFilter()],
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
        greaterThan: timestamp,
      },
    });
  }

  return filter;
};

/**
 * This method should be used **only** for filtering history elements in terms of Noir redeemed value
 * @param address Noir Account Id
 * @param noirAssetId Noir Asset Id
 */
export const noirHistoryElementsFilter = (
  address = 'cnW1pm3hDysWLCD4xvQAKFmW9QPjMG5zmnRxBpc6hd3P7CWP3',
  noirAssetId = ''
): any => {
  const filter: any = {
    and: [
      {
        method: {
          in: ['transfer'],
        },
      },
    ],
  };

  filter.and.push({
    or: [
      {
        data: {
          contains: {
            to: address,
            // amount: { greaterThan: 1 }, amount is a string so this operator doesn't work
          },
        },
      },
    ],
  });

  if (noirAssetId) {
    filter.and.push({
      or: createAssetFilters(noirAssetId),
    });
  }

  return filter;
};
