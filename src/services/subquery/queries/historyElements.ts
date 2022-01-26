import { Operation } from '@sora-substrate/util';
import { ModuleNames, ModuleMethods } from '../../types';
import { SubqueryDataParserService } from '../index';

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

type DataCriteria = {
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

const createOperationsCriteria = (operations: Array<Operation>) => {
  return operations.reduce((buffer: Array<any>, operation) => {
    if (!(operation in OperationFilterMap)) return buffer;

    buffer.push(OperationFilterMap[operation]);

    return buffer;
  }, []);
};

const createAssetCriteria = (assetAddress: string): Array<DataCriteria> => {
  const attributes = ['assetId', 'baseAssetId', 'targetAssetId'];

  return attributes.reduce((result: Array<DataCriteria>, attr) => {
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

const createAccountAddressCriteria = (address: string) => {
  return [
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
  ];
};

const isAccountAddress = (value: string) => value.startsWith('cn') && value.length === 49;
const isAssetAddress = (value: string) => value.startsWith('0x') && value.length === 66;

type HistoryElementsFilterOptions = {
  assetAddress?: string;
  timestamp?: number;
  query?: {
    search?: string;
    operations?: Array<Operation>;
    assetsAddresses?: Array<string>;
  };
};

export const historyElementsFilter = (
  accountAddress = '',
  {
    assetAddress = '',
    timestamp = 0,
    query: { search = '', operations = [], assetsAddresses = [] } = {},
  }: HistoryElementsFilterOptions = {}
): any => {
  const filter: any = {
    and: [],
  };

  filter.and.push({
    or: createOperationsCriteria(SubqueryDataParserService.supportedOperations),
  });

  if (accountAddress) {
    filter.and.push({
      or: createAccountAddressCriteria(accountAddress),
    });
  }

  if (assetAddress) {
    filter.and.push({
      or: createAssetCriteria(assetAddress),
    });
  }

  if (timestamp) {
    filter.and.push({
      timestamp: {
        greaterThan: timestamp,
      },
    });
  }

  const queryFilters: Array<any> = [];

  if (search) {
    // search criteria
    queryFilters.push({
      blockHash: {
        includesInsensitive: search,
      },
    });

    // account address criteria
    if (isAccountAddress(search)) {
      queryFilters.push({
        data: {
          contains: {
            from: search,
          },
        },
      });
      queryFilters.push({
        data: {
          contains: {
            to: search,
          },
        },
      });
      // asset address criteria
    } else if (isAssetAddress(search)) {
      queryFilters.push(...createAssetCriteria(search));
    }
  }

  // operations criteria
  if (operations.length) {
    queryFilters.push(...createOperationsCriteria(operations));
  }

  // symbol criteria
  if (assetsAddresses.length) {
    assetsAddresses.forEach((address) => {
      queryFilters.push(...createAssetCriteria(address));
    });
  }

  filter.and.push({
    or: queryFilters,
  });

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
      or: createAssetCriteria(noirAssetId),
    });
  }

  return filter;
};
