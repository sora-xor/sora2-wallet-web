import { Operation } from '@sora-substrate/util';
import { ModuleNames, ModuleMethods } from '../types';

export const HistoryElementsQuery = `
  query HistoryElements (
    $first: Int = null,
    $last: Int = null,
    $after: Cursor = "",
    $before: Cursor = "",
    $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC,
    $filter: HistoryElementFilter
    $idsOnly: Boolean! = false)
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
        cursor @skip(if: $idsOnly)
        node {
          id
          timestamp
          blockHash @skip(if: $idsOnly)
          blockHeight @skip(if: $idsOnly)
          module @skip(if: $idsOnly)
          method @skip(if: $idsOnly)
          address @skip(if: $idsOnly)
          networkFee @skip(if: $idsOnly)
          execution @skip(if: $idsOnly)
          data @skip(if: $idsOnly)
        }
      }
      pageInfo @skip(if: $idsOnly) {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount @skip(if: $idsOnly)
    }
  }
`;

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
  [Operation.ReferralSetInvitedUser]: {
    module: {
      equalTo: ModuleNames.Referrals,
    },
    method: {
      equalTo: ModuleMethods.ReferralsSetReferrer,
    },
  },
  [Operation.ReferralReserveXor]: {
    module: {
      equalTo: ModuleNames.Referrals,
    },
    method: {
      equalTo: ModuleMethods.ReferralsReserve,
    },
  },
  [Operation.ReferralUnreserveXor]: {
    module: {
      equalTo: ModuleNames.Referrals,
    },
    method: {
      equalTo: ModuleMethods.ReferralsUnreserve,
    },
  },
  [Operation.EthBridgeOutgoing]: {
    module: {
      equalTo: ModuleNames.EthBridge,
    },
    method: {
      equalTo: ModuleMethods.EthBridgeTransferToSidechain,
    },
  },
  [Operation.EthBridgeIncoming]: {
    module: {
      equalTo: ModuleNames.BridgeMultisig,
    },
    method: {
      equalTo: ModuleMethods.BridgeMultisigAsMulti,
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
  address?: string;
  assetAddress?: string;
  timestamp?: number;
  operations?: Array<Operation>;
  query?: {
    search?: string;
    operationNames?: Array<Operation>;
    assetsAddresses?: Array<string>;
  };
};

export const historyElementsFilter = ({
  address = '',
  assetAddress = '',
  timestamp = 0,
  operations = [],
  query: { search = '', operationNames = [], assetsAddresses = [] } = {},
}: HistoryElementsFilterOptions = {}): any => {
  const filter: any = {
    and: [],
  };

  if (operations.length) {
    filter.and.push({
      or: createOperationsCriteria(operations),
    });
  }

  if (address) {
    filter.and.push({
      or: createAccountAddressCriteria(address),
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

  // operation names criteria
  if (operationNames.length) {
    queryFilters.push(...createOperationsCriteria(operations));
  }

  // symbol criteria
  if (assetsAddresses.length) {
    assetsAddresses.forEach((address) => {
      queryFilters.push(...createAssetCriteria(address));
    });
  }

  if (queryFilters.length) {
    filter.and.push({
      or: queryFilters,
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
      or: createAssetCriteria(noirAssetId),
    });
  }

  return filter;
};
