import { BN } from '@polkadot/util';
import { FPNumber, Operation, TransactionStatus } from '@sora-substrate/util';
import { RewardType, RewardingEvents } from '@sora-substrate/util/build/rewards/consts';
import getOr from 'lodash/fp/getOr';
import omit from 'lodash/fp/omit';

import { api } from '../../../api';
import { ObjectInit } from '../../../consts';
import store from '../../../store';

import { ModuleNames, ModuleMethods } from './types';

import type {
  SubqueryHistoryElement,
  HistoryElementError,
  HistoryElementSwap,
  HistoryElementSwapTransfer,
  HistoryElementLiquidityOperation,
  HistoryElementTransfer,
  HistoryElementAssetRegistration,
  HistoryElementRewardsClaim,
  HistoryElementDemeterFarming,
  HistoryElementPlaceLimitOrder,
  HistoryElementCancelLimitOrder,
  HistoryElementSwapTransferBatch,
  SubqueryHistoryElementUtilityBatchAll,
  UtilityBatchCall,
  ReferralSetReferrer,
  ReferrerReserve,
  ClaimedRewardItem,
  SwapTransferBatchTransferParam,
  SubqueryUtilityBatchCall,
} from './types';
import type { HistoryItem } from '@sora-substrate/util';
import type { Asset, WhitelistItem } from '@sora-substrate/util/build/assets/types';
import type { LimitOrderHistory } from '@sora-substrate/util/build/orderBook/types';
import type { RewardClaimHistory, RewardInfo } from '@sora-substrate/util/build/rewards/types';

const insensitive = (value: string) => value.toLowerCase();

const OperationsMap = {
  [insensitive(ModuleNames.Assets)]: {
    [ModuleMethods.AssetsRegister]: () => Operation.RegisterAsset,
    [ModuleMethods.AssetsTransfer]: () => Operation.Transfer,
  },
  [insensitive(ModuleNames.PoolXYK)]: {
    [ModuleMethods.PoolXYKDepositLiquidity]: () => Operation.AddLiquidity,
    [ModuleMethods.PoolXYKWithdrawLiquidity]: () => Operation.RemoveLiquidity,
  },
  [insensitive(ModuleNames.LiquidityProxy)]: {
    [ModuleMethods.LiquidityProxySwap]: () => Operation.Swap,
    [ModuleMethods.LiquidityProxySwapTransfer]: () => Operation.SwapAndSend,
    [ModuleMethods.LiquidityProxySwapTransferBatch]: () => Operation.SwapTransferBatch,
    [ModuleMethods.LiquidityProxyXorlessTransfer]: () => Operation.Transfer,
  },
  [insensitive(ModuleNames.Utility)]: {
    [ModuleMethods.UtilityBatchAll]: (data: SubqueryHistoryElementUtilityBatchAll) => {
      if (!Array.isArray(data)) return null;

      if (
        !!getBatchCall(data, { module: ModuleNames.PoolXYK, method: ModuleMethods.PoolXYKInitializePool }) &&
        !!getBatchCall(data, { module: ModuleNames.PoolXYK, method: ModuleMethods.PoolXYKDepositLiquidity })
      ) {
        return Operation.CreatePair;
      }

      if (
        data.every(
          (item) =>
            isModuleMethod(item, ModuleNames.Rewards, ModuleMethods.RewardsClaim) ||
            isModuleMethod(item, ModuleNames.PswapDistribution, ModuleMethods.PswapDistributionClaimIncentive) ||
            isModuleMethod(item, ModuleNames.VestedRewards, ModuleMethods.VestedRewardsClaimRewards) ||
            isModuleMethod(item, ModuleNames.VestedRewards, ModuleMethods.VestedRewardsClaimCrowdloanRewards)
        )
      ) {
        return Operation.ClaimRewards;
      }

      return null;
    },
  },
  [insensitive(ModuleNames.Referrals)]: {
    [ModuleMethods.ReferralsSetReferrer]: () => Operation.ReferralSetInvitedUser,
    [ModuleMethods.ReferralsReserve]: () => Operation.ReferralReserveXor,
    [ModuleMethods.ReferralsUnreserve]: () => Operation.ReferralUnreserveXor,
  },
  [insensitive(ModuleNames.PswapDistribution)]: {
    [ModuleMethods.PswapDistributionClaimIncentive]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.Rewards)]: {
    [ModuleMethods.RewardsClaim]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.VestedRewards)]: {
    [ModuleMethods.VestedRewardsClaimRewards]: () => Operation.ClaimRewards,
    [ModuleMethods.VestedRewardsClaimCrowdloanRewards]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.DemeterFarming)]: {
    [ModuleMethods.DemeterFarmingDeposit]: (data: HistoryElementDemeterFarming) => {
      return data.isFarm ? Operation.DemeterFarmingDepositLiquidity : Operation.DemeterFarmingStakeToken;
    },
    [ModuleMethods.DemeterFarmingWithdraw]: (data: HistoryElementDemeterFarming) => {
      return data.isFarm ? Operation.DemeterFarmingWithdrawLiquidity : Operation.DemeterFarmingUnstakeToken;
    },
    [ModuleMethods.DemeterFarmingGetRewards]: () => Operation.DemeterFarmingGetRewards,
  },
  [insensitive(ModuleNames.OrderBook)]: {
    [ModuleMethods.OrderBookPlaceLimitOrder]: () => Operation.OrderBookPlaceLimitOrder,
    [ModuleMethods.OrderBookCancelLimitOrder]: () => Operation.OrderBookCancelLimitOrder,
    [ModuleMethods.OrderBookCancelLimitOrders]: () => Operation.OrderBookCancelLimitOrders,
  },
};

const getAssetSymbol = (asset: Nullable<Asset | WhitelistItem>): string => (asset && asset.symbol ? asset.symbol : '');

const getTransactionId = (tx: SubqueryHistoryElement): string => tx.id;

const isModuleMethod = (item: UtilityBatchCall, module: string, method: string) =>
  insensitive(item.module) === insensitive(module) && insensitive(item.method) === insensitive(method);

const getBatchCall = (calls: Array<SubqueryUtilityBatchCall>, { module, method }): Nullable<SubqueryUtilityBatchCall> =>
  calls.find((item) => isModuleMethod(item, module, method));

const getTransactionOperationType = (tx: SubqueryHistoryElement): Nullable<Operation> => {
  const { module, method, data } = tx;

  const operationGetter = getOr(ObjectInit, [insensitive(module), method], OperationsMap);

  return operationGetter(data);
};

const getTransactionTimestamp = (tx: SubqueryHistoryElement): number => {
  const timestamp = tx.timestamp * 1000;

  return !Number.isNaN(timestamp) ? timestamp : Date.now();
};

const getErrorMessage = (historyElementError: HistoryElementError): Record<string, string> => {
  try {
    const [error, index] = [new BN(historyElementError.moduleErrorId), new BN(historyElementError.moduleErrorIndex)];
    const { name, section } = api.api.registry.findMetaError({ error, index });
    return { name, section };
  } catch (error) {
    console.error(historyElementError, error);
    return { section: '', name: '' };
  }
};

const getTransactionStatus = (tx: SubqueryHistoryElement): string => {
  if (tx.execution.success) return TransactionStatus.Finalized;

  return TransactionStatus.Error;
};

const getAssetByAddress = async (address: string): Promise<Nullable<Asset>> => {
  try {
    const asset = store.getters.wallet.account.assetsDataTable[address];
    return asset ?? (await api.assets.getAssetInfo(address));
  } catch (error) {
    console.error(error);
    return null;
  }
};

const logOperationDataParsingError = (operation: Operation, transaction: SubqueryHistoryElement): void => {
  console.error(`Couldn't parse ${operation} data.`, transaction);
};

const formatRewards = async (rewards: ClaimedRewardItem[]): Promise<RewardInfo[]> => {
  const formatted: RewardInfo[] = [];

  for (const { assetId, amount } of rewards) {
    const asset = await getAssetByAddress(assetId);

    if (asset) {
      formatted.push({
        amount,
        asset,
        type: ['' as RewardType, RewardingEvents.Unspecified],
      });
    }
  }

  return formatted;
};

export default class SubqueryDataParser {
  // Operations visible in wallet
  public static SUPPORTED_OPERATIONS = [
    Operation.Transfer,
    Operation.Swap,
    Operation.SwapAndSend,
    Operation.SwapTransferBatch,
    Operation.CreatePair,
    Operation.AddLiquidity,
    Operation.RemoveLiquidity,
    Operation.RegisterAsset,
    Operation.ReferralSetInvitedUser,
    Operation.ReferralReserveXor,
    Operation.ReferralUnreserveXor,
    Operation.ClaimRewards,
    Operation.DemeterFarmingDepositLiquidity,
    Operation.DemeterFarmingWithdrawLiquidity,
    Operation.DemeterFarmingStakeToken,
    Operation.DemeterFarmingUnstakeToken,
    Operation.DemeterFarmingGetRewards,
    Operation.OrderBookPlaceLimitOrder,
    Operation.OrderBookCancelLimitOrder,
    Operation.OrderBookCancelLimitOrders,
  ];

  public get supportedOperations(): Array<Operation> {
    return SubqueryDataParser.SUPPORTED_OPERATIONS;
  }

  public async parseTransactionAsHistoryItem(transaction: SubqueryHistoryElement): Promise<Nullable<HistoryItem>> {
    const type = getTransactionOperationType(transaction);

    if (!type) return null;

    // rewards transaction data could be nullable
    if (!transaction.data && type !== Operation.ClaimRewards) {
      logOperationDataParsingError(type, transaction);
      return null;
    }

    const id = getTransactionId(transaction);
    const timestamp = getTransactionTimestamp(transaction);
    const blockHeight = +transaction.blockHeight;
    const blockId = transaction.blockHash;

    // common attributes
    const payload: HistoryItem = {
      id, // history item id will be txId
      type,
      txId: id,
      blockId,
      blockHeight,
      endTime: timestamp,
      startTime: timestamp,
      from: transaction.address,
      soraNetworkFee: transaction.networkFee,
      status: getTransactionStatus(transaction),
    };

    if (transaction.execution.error) {
      const { name, section } = getErrorMessage(transaction.execution.error);

      payload.errorMessage = {
        section,
        name,
      };
    }

    switch (type) {
      case Operation.Swap:
      case Operation.SwapAndSend: {
        const data = transaction.data as HistoryElementSwap & HistoryElementSwapTransfer;

        const assetAddress = data.baseAssetId;
        const asset2Address = data.targetAssetId;
        const asset = await getAssetByAddress(assetAddress);
        const asset2 = await getAssetByAddress(asset2Address);

        payload.assetAddress = assetAddress;
        payload.asset2Address = asset2Address;
        payload.amount = data.baseAssetAmount;
        payload.amount2 = data.targetAssetAmount;
        payload.symbol = getAssetSymbol(asset);
        payload.symbol2 = getAssetSymbol(asset2);
        payload.liquiditySource = data.selectedMarket;
        payload.liquidityProviderFee = new FPNumber(data.liquidityProviderFee).toCodecString();

        if (data.to) {
          payload.to = data.to;
        }

        return payload;
      }
      case Operation.SwapTransferBatch: {
        const data = transaction.data as HistoryElementSwapTransferBatch;

        const inputAssetId = data.inputAssetId;
        const inputAsset = await getAssetByAddress(inputAssetId);
        const transfers = data.transfers;
        const exchanges = data.exchanges;

        const outcomeAssetsIds = data.receivers.map((item) => item.outcomeAssetId?.code);
        const resolveAssets = async (assetAddressesArray: Array<string>) => {
          const result: Array<Nullable<Asset>> = [];
          assetAddressesArray.forEach(async (address) => {
            result.push(await getAssetByAddress(address));
          });
          return result;
        };
        const assetsList = await resolveAssets(outcomeAssetsIds);

        payload.assetAddress = inputAssetId;
        payload.liquiditySource = data.selectedMarket;
        payload.amount = data.inputAmount;
        payload.symbol = getAssetSymbol(inputAsset);

        payload.payload = {};

        payload.payload.adarFee = data.adarFee;
        payload.payload.maxInputAmount = data.maxInputAmount;
        payload.payload.networkFee = data.networkFee;
        payload.payload.blockNumber = data.blockNumber;
        payload.payload.actualFee = data.actualFee;
        payload.payload.transfers = transfers;
        payload.payload.exchanges = exchanges;
        if (transfers.length > 0) {
          payload.payload.receivers = data.receivers.reduce((acc, data) => {
            const receiversData = data.receivers.map((receiver) => {
              const transfer = transfers?.find(
                (transfer) => transfer.to === receiver.accountId
              ) as SwapTransferBatchTransferParam;
              const assetAddress = transfer?.assetId || data.outcomeAssetId?.code;
              const asset = assetsList.find((asset) => asset?.address === assetAddress);
              return {
                accountId: receiver.accountId,
                asset,
                amount: transfer?.amount || '0',
                symbol: getAssetSymbol(asset),
              };
            });
            return [...acc, ...receiversData];
          }, []);
        } else {
          payload.payload.receivers = [];
        }
        return payload;
      }
      case Operation.AddLiquidity:
      case Operation.RemoveLiquidity: {
        const data = transaction.data as HistoryElementLiquidityOperation;

        const assetAddress = data.baseAssetId;
        const asset2Address = data.targetAssetId;
        const asset = await getAssetByAddress(assetAddress);
        const asset2 = await getAssetByAddress(asset2Address);

        payload.assetAddress = assetAddress;
        payload.asset2Address = asset2Address;
        payload.symbol = getAssetSymbol(asset);
        payload.symbol2 = getAssetSymbol(asset2);
        payload.amount = data.baseAssetAmount;
        payload.amount2 = data.targetAssetAmount;

        return payload;
      }
      case Operation.CreatePair: {
        const data = transaction.data as SubqueryHistoryElementUtilityBatchAll;
        const call = getBatchCall(data, {
          module: ModuleNames.PoolXYK,
          method: ModuleMethods.PoolXYKDepositLiquidity,
        });

        if (!call) {
          logOperationDataParsingError(type, transaction);
          return null;
        }

        const {
          input_asset_a: assetAddress,
          input_asset_b: asset2Address,
          input_a_desired: amount,
          input_b_desired: amount2,
        } = call.data.args;

        const asset = await getAssetByAddress(assetAddress as string);
        const asset2 = await getAssetByAddress(asset2Address as string);

        payload.assetAddress = asset ? (assetAddress as string) : '';
        payload.asset2Address = asset2 ? (asset2Address as string) : '';
        payload.symbol = getAssetSymbol(asset);
        payload.symbol2 = getAssetSymbol(asset2);
        payload.amount = String(amount);
        payload.amount2 = String(amount2);

        return payload;
      }
      case Operation.Transfer: {
        const data = transaction.data as HistoryElementTransfer;

        const assetAddress = data.assetId;
        const asset = await getAssetByAddress(assetAddress);

        payload.assetAddress = assetAddress;
        payload.symbol = getAssetSymbol(asset);
        payload.to = data.to;
        payload.amount = data.amount;
        // [TODO] update History in js-lib
        (payload as any).assetFee = data.assetFee;
        (payload as any).xorFee = data.xorFee;
        (payload as any).comment = data.comment;

        return payload;
      }
      case Operation.RegisterAsset: {
        const data = transaction.data as HistoryElementAssetRegistration;

        const assetAddress = data.assetId;
        const asset = await getAssetByAddress(assetAddress);

        payload.symbol = getAssetSymbol(asset);

        return payload;
      }
      case Operation.ReferralSetInvitedUser: {
        const data = transaction.data as ReferralSetReferrer;
        payload.to = data.to;
        return payload;
      }
      case Operation.ReferralReserveXor:
      case Operation.ReferralUnreserveXor: {
        const data = transaction.data as ReferrerReserve;
        payload.amount = data.amount;
        return payload;
      }
      case Operation.ClaimRewards: {
        const rewardsData =
          transaction.module === ModuleNames.Utility ? [] : (transaction.data as HistoryElementRewardsClaim);

        (payload as RewardClaimHistory).rewards = Array.isArray(rewardsData) ? await formatRewards(rewardsData) : [];

        return payload;
      }
      case Operation.DemeterFarmingDepositLiquidity:
      case Operation.DemeterFarmingWithdrawLiquidity: {
        const data = transaction.data as HistoryElementDemeterFarming;

        const assetAddress = data.baseAssetId as string;
        const asset2Address = data.assetId;

        const asset = await getAssetByAddress(assetAddress);
        const asset2 = await getAssetByAddress(asset2Address);

        payload.assetAddress = assetAddress;
        payload.asset2Address = asset2Address;
        payload.symbol = getAssetSymbol(asset);
        payload.symbol2 = getAssetSymbol(asset2);
        payload.amount = data.amount;

        return payload;
      }
      case Operation.DemeterFarmingStakeToken:
      case Operation.DemeterFarmingUnstakeToken:
      case Operation.DemeterFarmingGetRewards: {
        const data = transaction.data as HistoryElementDemeterFarming;

        const assetAddress = data.assetId;
        const asset = await getAssetByAddress(assetAddress);

        payload.assetAddress = assetAddress;
        payload.symbol = getAssetSymbol(asset);
        payload.amount = data.amount;

        return payload;
      }
      case Operation.OrderBookPlaceLimitOrder: {
        const data = transaction.data as HistoryElementPlaceLimitOrder;

        const _payload = payload as LimitOrderHistory;

        _payload.assetAddress = data.baseAssetId;
        _payload.asset2Address = data.quoteAssetId;
        _payload.price = new FPNumber(data.price).toString();
        _payload.amount = new FPNumber(data.amount).toString();
        _payload.side = data.side;
        _payload.limitOrderTimestamp = data.lifetime;

        return payload;
      }
      case Operation.OrderBookCancelLimitOrder:
      case Operation.OrderBookCancelLimitOrders: {
        const data = transaction.data as HistoryElementCancelLimitOrder;

        const _payload = payload as LimitOrderHistory;

        _payload.assetAddress = data[0].baseAssetId;
        _payload.asset2Address = data[0].quoteAssetId;
        _payload.limitOrderIds = data.map((order) => order.orderId);

        return payload;
      }
      default:
        return null;
    }
  }
}
