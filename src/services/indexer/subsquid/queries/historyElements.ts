/* eslint-disable camelcase */
import { Operation } from '@sora-substrate/util';
import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';
import { ModuleNames, ModuleMethods } from '../types';

import type { SubsquidHistoryElement, SubsquidQueryResponse, SubsquidConnectionQueryResponse } from '../types';

export const HistoryElementsQuery = gql<SubsquidQueryResponse<SubsquidHistoryElement>>`
  query SubsquidHistoryElements(
    $limit: Int
    $offset: Int = null
    $orderBy: [HistoryElementOrderByInput!] = timestamp_DESC
    $filter: HistoryElementWhereInput
    $idsOnly: Boolean! = false
  ) {
    info: historyElementsConnection(first: 0, orderBy: $orderBy, where: $filter) {
      totalCount
    }
    nodes: historyElements(limit: $limit, offset: $offset, orderBy: $orderBy, where: $filter) {
      id
      timestamp
      blockHash @skip(if: $idsOnly)
      blockHeight @skip(if: $idsOnly)
      module @skip(if: $idsOnly)
      method @skip(if: $idsOnly)
      address @skip(if: $idsOnly)
      networkFee @skip(if: $idsOnly)
      execution @skip(if: $idsOnly) {
        success
        error {
          moduleErrorId
          moduleErrorIndex
          nonModuleErrorMessage
        }
      }
      data @skip(if: $idsOnly)
    }
  }
`;

export const HistoryElementsConnectionQuery = gql<SubsquidConnectionQueryResponse<SubsquidHistoryElement>>`
  query SubsquidHistoryElementsConnection(
    $first: Int
    $after: String = null
    $orderBy: [HistoryElementOrderByInput!] = timestamp_DESC
    $filter: HistoryElementWhereInput
    $idsOnly: Boolean! = false
  ) {
    data: historyElementsConnection(first: $first, after: $after, orderBy: $orderBy, where: $filter) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          id
          timestamp
          blockHash @skip(if: $idsOnly)
          blockHeight @skip(if: $idsOnly)
          module @skip(if: $idsOnly)
          method @skip(if: $idsOnly)
          address @skip(if: $idsOnly)
          networkFee @skip(if: $idsOnly)
          execution @skip(if: $idsOnly) {
            success
            error {
              moduleErrorId
              moduleErrorIndex
              nonModuleErrorMessage
            }
          }
          data @skip(if: $idsOnly)
        }
      }
    }
  }
  ${PageInfoFragment}
`;

type DataCriteria = {
  data_jsonContains: {
    [key: string]: any;
  };
};

type CallsDataCriteria = {
  calls_some: {
    data_jsonContains: {
      [key: string]: any;
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
  module_eq: ModuleNames.DemeterFarming,
  method_eq: ModuleMethods.DemeterFarmingDeposit,
};

const DemeterFarmingWithdraw = {
  module_eq: ModuleNames.DemeterFarming,
  method_eq: ModuleMethods.DemeterFarmingWithdraw,
};

const OperationFilterMap = {
  [Operation.Swap]: {
    module_eq: ModuleNames.LiquidityProxy,
    method_eq: ModuleMethods.LiquidityProxySwap,
  },
  [Operation.SwapAndSend]: {
    module_eq: ModuleNames.LiquidityProxy,
    method_eq: ModuleMethods.LiquidityProxySwapTransfer,
  },
  [Operation.Transfer]: {
    module_eq: ModuleNames.Assets,
    method_eq: ModuleMethods.AssetsTransfer,
  },
  [Operation.RegisterAsset]: {
    module_eq: ModuleNames.Assets,
    method_eq: ModuleMethods.AssetsRegister,
  },
  [Operation.CreatePair]: {
    module_eq: ModuleNames.Utility,
    method_eq: ModuleMethods.UtilityBatchAll,
    callNames_containsAny: [
      ModuleNames.PoolXYK + '.' + ModuleMethods.PoolXYKInitializePool,
      ModuleNames.PoolXYK + '.' + ModuleMethods.PoolXYKDepositLiquidity,
    ],
  },
  [Operation.AddLiquidity]: {
    module_containsInsensitive: ModuleNames.PoolXYK,
    method_eq: ModuleMethods.PoolXYKDepositLiquidity,
  },
  [Operation.RemoveLiquidity]: {
    module_containsInsensitive: ModuleNames.PoolXYK,
    method_eq: ModuleMethods.PoolXYKWithdrawLiquidity,
  },
  [Operation.ReferralSetInvitedUser]: {
    module_eq: ModuleNames.Referrals,
    method_eq: ModuleMethods.ReferralsSetReferrer,
  },
  [Operation.ReferralReserveXor]: {
    module_eq: ModuleNames.Referrals,
    method_eq: ModuleMethods.ReferralsReserve,
  },
  [Operation.ReferralUnreserveXor]: {
    module_eq: ModuleNames.Referrals,
    method_eq: ModuleMethods.ReferralsUnreserve,
  },
  [Operation.EthBridgeOutgoing]: {
    module_eq: ModuleNames.EthBridge,
    method_eq: ModuleMethods.EthBridgeTransferToSidechain,
  },
  [Operation.EthBridgeIncoming]: {
    module_eq: ModuleNames.BridgeMultisig,
    method_eq: ModuleMethods.BridgeMultisigAsMulti,
  },
  [Operation.ClaimRewards]: {
    OR: [
      ...RewardsClaimExtrinsics.map(([module, method]) => ({
        module_eq: module,
        method_eq: method,
      })),
      {
        module_eq: ModuleNames.Utility,
        method_eq: ModuleMethods.UtilityBatchAll,
        callNames_containsAny: RewardsClaimExtrinsics.map(([module, method]) => module + '.' + method),
      },
    ],
  },
  // DEMETER
  [Operation.DemeterFarmingDepositLiquidity]: DemeterFarmingDeposit,
  [Operation.DemeterFarmingWithdrawLiquidity]: DemeterFarmingWithdraw,
  [Operation.DemeterFarmingStakeToken]: DemeterFarmingDeposit,
  [Operation.DemeterFarmingUnstakeToken]: DemeterFarmingWithdraw,
  [Operation.DemeterFarmingGetRewards]: {
    module_eq: ModuleNames.DemeterFarming,
    method_eq: ModuleMethods.DemeterFarmingGetRewards,
  },
};

const createOperationsCriteria = (operations: Array<Operation>) => {
  return operations.reduce((buffer: Array<any>, operation) => {
    if (!(operation in OperationFilterMap)) return buffer;

    buffer.push(OperationFilterMap[operation]);

    return buffer;
  }, []);
};

const createAssetCriteria = (assetAddress: string): Array<DataCriteria | CallsDataCriteria> => {
  const attributes = ['assetId', 'baseAssetId', 'targetAssetId'];

  const criterias = attributes.reduce((result: Array<DataCriteria | CallsDataCriteria>, attr) => {
    result.push({
      data_jsonContains: {
        [attr]: assetAddress,
      },
    });

    return result;
  }, []);

  // for rewards claim operation
  criterias.push({
    calls_some: {
      data_jsonContains: {
        assetId: assetAddress,
      },
    },
  });

  // for create pair operation
  ['input_asset_a', 'input_asset_b'].forEach((attr) => {
    criterias.push({
      calls_some: {
        data_jsonContains: {
          [attr]: assetAddress,
        },
      },
    });
  });

  return criterias;
};

const createAccountAddressCriteria = (address: string) => {
  return [
    {
      address_eq: address,
    },
    {
      dataTo_eq: address,
    },
  ];
};

const isAccountAddress = (value: string) => value.startsWith('cn') && value.length === 49;
const isAssetAddress = (value: string) => value.startsWith('0x') && value.length === 66;

type SubsquidHistoryElementsFilterOptions = {
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
}: SubsquidHistoryElementsFilterOptions = {}): any => {
  const filter: any = {
    AND: [],
  };

  if (operations.length) {
    filter.AND.push({
      OR: createOperationsCriteria(operations),
    });
  }

  if (address) {
    filter.AND.push({
      OR: createAccountAddressCriteria(address),
    });
  }

  if (assetAddress) {
    filter.AND.push({
      OR: createAssetCriteria(assetAddress),
    });
  }

  if (timestamp) {
    filter.AND.push({
      timestamp_gt: timestamp,
    });
  }

  if (ids.length) {
    filter.AND.push({
      id_in: ids,
    });
  }

  const queryFilters: Array<any> = [];

  if (search) {
    // search criteria
    queryFilters.push({
      blockHash_containsInsensitive: search,
    });

    // account address criteria
    if (isAccountAddress(search)) {
      queryFilters.push({
        dataFrom_eq: search,
      });
      queryFilters.push({
        dataTo_eq: search,
      });
      // asset address criteria
    } else if (isAssetAddress(search)) {
      queryFilters.push(...createAssetCriteria(search));
    }
  }

  // operation names criteria
  if (operationNames.length) {
    queryFilters.push(...createOperationsCriteria(operationNames));
  }

  // symbol criteria
  if (assetsAddresses.length) {
    assetsAddresses.forEach((address) => {
      queryFilters.push(...createAssetCriteria(address));
    });
  }

  if (queryFilters.length) {
    filter.AND.push({
      OR: queryFilters,
    });
  }

  return filter;
};
