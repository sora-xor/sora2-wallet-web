import { Operation } from '@sora-substrate/util';
import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { ModuleNames, ModuleMethods } from '../types';

import type { ConnectionQueryResponse } from '../../types';
import type { SubqueryHistoryElement } from '../types';

export const HistoryElementsQuery = gql<ConnectionQueryResponse<SubqueryHistoryElement>>`
  query SubqueryHistoryElements(
    $first: Int = null
    $last: Int = null
    $offset: Int = null
    $after: Cursor = ""
    $before: Cursor = ""
    $orderBy: [HistoryElementsOrderBy!] = TIMESTAMP_DESC
    $filter: HistoryElementFilter
  ) {
    data: historyElements(
      first: $first
      last: $last
      offset: $offset
      before: $before
      after: $after
      orderBy: $orderBy
      filter: $filter
    ) {
      edges {
        node {
          id
          timestamp
          blockHash
          blockHeight
          module
          method
          address
          networkFee
          execution
          data
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
      totalCount
    }
  }
  ${PageInfoFragment}
`;

type DataCriteria = {
  data: {
    contains: {
      [key: string]: any;
    };
  };
};

type CallsDataCriteria = {
  calls: {
    some: {
      data: {
        contains: {
          [key: string]: any;
        };
      };
    };
  };
};

const RewardsClaimExtrinsics = [
  [ModuleNames.PswapDistribution, ModuleMethods.PswapDistributionClaimIncentive],
  [ModuleNames.Rewards, ModuleMethods.RewardsClaim],
  [ModuleNames.VestedRewards, ModuleMethods.VestedRewardsClaimRewards],
  [ModuleNames.VestedRewards, ModuleMethods.VestedRewardsClaimCrowdloanRewards],
];

const DemeterFarmingDeposit = {
  module: {
    equalTo: ModuleNames.DemeterFarming,
  },
  method: {
    equalTo: ModuleMethods.DemeterFarmingDeposit,
  },
};

const DemeterFarmingWithdraw = {
  module: {
    equalTo: ModuleNames.DemeterFarming,
  },
  method: {
    equalTo: ModuleMethods.DemeterFarmingWithdraw,
  },
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
  [Operation.SwapAndSend]: {
    module: {
      equalTo: ModuleNames.LiquidityProxy,
    },
    method: {
      equalTo: ModuleMethods.LiquidityProxySwapTransfer,
    },
  },
  [Operation.SwapTransferBatch]: {
    module: {
      equalTo: ModuleNames.LiquidityProxy,
    },
    method: {
      equalTo: ModuleMethods.LiquidityProxySwapTransferBatch,
    },
  },
  [Operation.Transfer]: {
    or: [
      {
        module: {
          equalTo: ModuleNames.Assets,
        },
        method: {
          equalTo: ModuleMethods.AssetsTransfer,
        },
      },
      {
        module: {
          equalTo: ModuleNames.LiquidityProxy,
        },
        method: {
          equalTo: ModuleMethods.LiquidityProxyXorlessTransfer,
        },
      },
    ],
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
    data: {
      contains: [
        {
          module: ModuleNames.PoolXYK,
          method: ModuleMethods.PoolXYKInitializePool,
        },
        {
          module: ModuleNames.PoolXYK,
          method: ModuleMethods.PoolXYKDepositLiquidity,
        },
      ],
    },
  },
  [Operation.AddLiquidity]: {
    module: {
      includesInsensitive: ModuleNames.PoolXYK,
    },
    method: {
      equalTo: ModuleMethods.PoolXYKDepositLiquidity,
    },
  },
  [Operation.RemoveLiquidity]: {
    module: {
      includesInsensitive: ModuleNames.PoolXYK,
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
  [Operation.ClaimRewards]: {
    or: [
      ...RewardsClaimExtrinsics.map(([module, method]) => ({
        module: {
          equalTo: module,
        },
        method: {
          equalTo: method,
        },
      })),
      {
        module: {
          equalTo: ModuleNames.Utility,
        },
        method: {
          equalTo: ModuleMethods.UtilityBatchAll,
        },
        or: RewardsClaimExtrinsics.map(([module, method]) => ({
          data: {
            contains: [
              {
                module,
                method,
              },
            ],
          },
        })),
      },
    ],
  },
  // DEMETER
  [Operation.DemeterFarmingDepositLiquidity]: DemeterFarmingDeposit,
  [Operation.DemeterFarmingWithdrawLiquidity]: DemeterFarmingWithdraw,
  [Operation.DemeterFarmingStakeToken]: DemeterFarmingDeposit,
  [Operation.DemeterFarmingUnstakeToken]: DemeterFarmingWithdraw,
  [Operation.DemeterFarmingGetRewards]: {
    module: {
      equalTo: ModuleNames.DemeterFarming,
    },
    method: {
      equalTo: ModuleMethods.DemeterFarmingGetRewards,
    },
  },
  // ORDER BOOK
  [Operation.OrderBookPlaceLimitOrder]: {
    module: {
      equalTo: ModuleNames.OrderBook,
    },
    method: {
      equalTo: ModuleMethods.OrderBookPlaceLimitOrder,
    },
  },
  [Operation.OrderBookCancelLimitOrder]: {
    module: {
      equalTo: ModuleNames.OrderBook,
    },
    method: {
      equalTo: ModuleMethods.OrderBookCancelLimitOrders,
    },
  },
  [Operation.OrderBookCancelLimitOrders]: {
    module: {
      equalTo: ModuleNames.OrderBook,
    },
    method: {
      equalTo: ModuleMethods.OrderBookCancelLimitOrders,
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

const createAdarSenderCriteria = (accountAddress: string, assetAddress: string) => {
  return [
    {
      data: {
        contains: {
          inputAssetId: assetAddress,
          from: accountAddress,
        },
      },
    },
  ];
};

const createAdarReceiverCriteria = (accountAddress: string, assetAddress: string) => {
  return [
    {
      data: {
        contains: {
          transfers: [
            {
              assetId: assetAddress,
              to: accountAddress,
            },
          ],
        },
      },
    },
  ];
};

const createAssetCriteria = (
  assetAddress: string,
  accountAddress?: string
): Array<DataCriteria | CallsDataCriteria> => {
  const attributes = ['assetId', 'baseAssetId', 'targetAssetId', 'quoteAssetId'];

  const criterias = attributes.reduce((result: Array<DataCriteria | CallsDataCriteria>, attr) => {
    result.push({
      data: {
        contains: {
          [attr]: assetAddress,
        },
      },
    });

    return result;
  }, []);

  // for create pair operation
  ['input_asset_a', 'input_asset_b'].forEach((attr) => {
    criterias.push({
      calls: {
        some: {
          data: {
            contains: {
              [attr]: assetAddress,
            },
          },
        },
      },
    });
  });

  if (accountAddress) {
    criterias.push(
      ...createAdarSenderCriteria(accountAddress, assetAddress),
      ...createAdarReceiverCriteria(accountAddress, assetAddress)
    );
  }

  return criterias;
};

const createAccountAddressCriteria = (address: string) => {
  return [
    // sender
    {
      and: [
        {
          address: {
            equalTo: address,
          },
        },
        {
          or: [
            {
              dataTo: {
                isNull: true,
              },
            },
            {
              module: {
                notEqualTo: ModuleNames.LiquidityProxy,
              },
              method: {
                notEqualTo: ModuleMethods.LiquidityProxySwapTransferBatch,
              },
            },
          ],
        },
      ],
    },
    // recipient
    {
      dataTo: {
        equalTo: address,
      },
    },
  ];
};

const isAccountAddress = (value: string) => value.startsWith('cn') && value.length === 49;
const isAssetAddress = (value: string) => value.startsWith('0x') && value.length === 66;

type SubqueryHistoryElementsFilterOptions = {
  address?: string;
  assetAddress?: string;
  timestamp?: number;
  operations?: Array<Operation>;
  ids?: Array<string>;
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
  ids = [],
  query: { search = '', operationNames = [], assetsAddresses = [] } = {},
}: SubqueryHistoryElementsFilterOptions = {}): any => {
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
      or: createAssetCriteria(assetAddress, address),
    });
  }

  if (timestamp) {
    filter.and.push({
      timestamp: {
        greaterThan: timestamp,
      },
    });
  }

  if (ids.length) {
    filter.and.push({
      id: {
        in: ids,
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
        dataFrom: {
          equalTo: search,
        },
      });
      queryFilters.push({
        dataTo: {
          equalTo: search,
        },
      });
      // asset address criteria
    } else if (isAssetAddress(search)) {
      queryFilters.push(...createAssetCriteria(search, address));
    }
  }

  // operation names criteria
  if (operationNames.length) {
    queryFilters.push(...createOperationsCriteria(operationNames));
  }

  // symbol criteria
  if (assetsAddresses.length) {
    assetsAddresses.forEach((assetAddress) => {
      queryFilters.push(...createAssetCriteria(assetAddress, address));
    });
  }

  if (queryFilters.length) {
    filter.and.push({
      or: queryFilters,
    });
  }

  return filter;
};
