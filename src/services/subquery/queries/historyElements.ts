import { Operation } from '@sora-substrate/util';
import { ModuleNames, ModuleMethods } from '../../types';

export const createHistoryElementsQuery = ({ data = true } = {}) => {
  return `
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
      edges {${
        data
          ? `
        cursor`
          : ''
      }
        node {
          id${
            data
              ? `
          blockHash
          blockHeight
          module
          method
          address
          networkFee
          execution
          timestamp
          data`
              : ''
          }
        }
      }${
        data
          ? `
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount`
          : ''
      }
    }
  }
`;
};

type AssetFilter = {
  data: {
    contains: {
      [key: string]: string;
    };
  };
};

const OperationFilterMap = {
  [Operation.Swap]: {
    module: {
      equalTo: ModuleNames.LiquidityProxy,
    },
    method: {
      equalTo: ModuleMethods.LiquidityProxySwap,
    },
  },
  [Operation.Transfer]: {
    module: {
      equalTo: ModuleNames.Assets,
    },
    method: {
      equalTo: ModuleMethods.AssetsTransfer,
    },
  },
  [Operation.RegisterAsset]: {
    module: {
      equalTo: ModuleNames.Assets,
    },
    method: {
      equalTo: ModuleMethods.AssetsRegister,
    },
  },
  [Operation.CreatePair]: {
    module: {
      equalTo: ModuleNames.Utility,
    },
    method: {
      equalTo: ModuleMethods.UtilityBatchAll,
    },
  },
  [Operation.AddLiquidity]: {
    module: {
      equalTo: ModuleNames.PoolXYK,
    },
    method: {
      equalTo: ModuleMethods.PoolXYKDepositLiquidity,
    },
  },
  [Operation.RemoveLiquidity]: {
    module: {
      equalTo: ModuleNames.PoolXYK,
    },
    method: {
      equalTo: ModuleMethods.PoolXYKWithdrawLiquidity,
    },
  },
};

const createOperationsFilter = (operations: Array<Operation>) => {
  return {
    or: operations.reduce((buffer: Array<any>, operation) => {
      if (!(operation in OperationFilterMap)) return buffer;

      buffer.push(OperationFilterMap[operation]);

      return buffer;
    }, []),
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

const createAccountAddressFilter = (address: string) => {
  return {
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
  };
};

type HistoryElementsFilterOptions = {
  operations?: Array<Operation>;
  assetAddress?: string;
  timestamp?: number;
  query?: string;
};

export const historyElementsFilter = (
  address = '',
  { operations = [], assetAddress = '', timestamp = 0, query = '' }: HistoryElementsFilterOptions = {}
): any => {
  const filter: any = {
    and: [],
  };

  if (address) {
    filter.and.push(createAccountAddressFilter(address));
  }

  if (operations) {
    filter.and.push(createOperationsFilter(operations));
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

  if (query) {
    filter.and.push({
      or: [
        {
          blockHash: {
            includesInsensitive: query,
          },
        },
        {
          data: {
            contains: {
              from: query,
            },
          },
        },
        {
          data: {
            contains: {
              to: query,
            },
          },
        },
        ...createAssetFilters(query),
      ],
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
