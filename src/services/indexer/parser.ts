import { BN } from '@polkadot/util';
import { FPNumber, Operation, TransactionStatus } from '@sora-substrate/util';
import { RewardType, RewardingEvents } from '@sora-substrate/util/build/rewards/consts';
import getOr from 'lodash/fp/getOr';

import { api } from '../../api';
import { ObjectInit } from '../../consts';
import store from '../../store';

import { ModuleNames, ModuleMethods } from './subquery/types';

import type {
  HistoryElement,
  HistoryElementError,
  HistoryElementSwap,
  HistoryElementSwapTransfer,
  HistoryElementLiquidityOperation,
  HistoryElementTransfer,
  HistoryElementAssetRegistration,
  HistoryElementAssetBurn,
  HistoryElementRewardsClaim,
  HistoryElementDemeterFarming,
  HistoryElementPlaceLimitOrder,
  HistoryElementCancelLimitOrder,
  HistoryElementSwapTransferBatch,
  HistoryElementBatchCall,
  HistoryElementReferrerReserve,
  ClaimedRewardItem,
} from './subquery/types';
import type { HistoryItem } from '@sora-substrate/util';
import type {
  Asset,
  WhitelistItem,
  HistoryElementTransfer as HistoryXorlessTransfer,
} from '@sora-substrate/util/build/assets/types';
import type { LimitOrderHistory } from '@sora-substrate/util/build/orderBook/types';
import type { RewardClaimHistory, RewardInfo } from '@sora-substrate/util/build/rewards/types';

const insensitive = (value: string) => value.toLowerCase();

const OperationsMap = {
  [insensitive(ModuleNames.Assets)]: {
    [insensitive(ModuleMethods.AssetsRegister)]: () => Operation.RegisterAsset,
    [insensitive(ModuleMethods.AssetsTransfer)]: () => Operation.Transfer,
    [insensitive(ModuleMethods.AssetsBurn)]: () => Operation.Burn,
    [insensitive(ModuleMethods.AssetsMint)]: () => Operation.Mint,
  },
  [insensitive(ModuleNames.PoolXYK)]: {
    [insensitive(ModuleMethods.PoolXYKDepositLiquidity)]: () => Operation.AddLiquidity,
    [insensitive(ModuleMethods.PoolXYKWithdrawLiquidity)]: () => Operation.RemoveLiquidity,
  },
  [insensitive(ModuleNames.LiquidityProxy)]: {
    [insensitive(ModuleMethods.LiquidityProxySwap)]: () => Operation.Swap,
    [insensitive(ModuleMethods.LiquidityProxySwapTransfer)]: () => Operation.SwapAndSend,
    [insensitive(ModuleMethods.LiquidityProxySwapTransferBatch)]: () => Operation.SwapTransferBatch,
    [insensitive(ModuleMethods.LiquidityProxyXorlessTransfer)]: () => Operation.Transfer,
  },
  [insensitive(ModuleNames.Utility)]: {
    [insensitive(ModuleMethods.UtilityBatchAll)]: (data: HistoryElementBatchCall[]) => {
      if (!(Array.isArray(data) && !!data.length)) return null;

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
    [insensitive(ModuleMethods.ReferralsSetReferrer)]: () => Operation.ReferralSetInvitedUser,
    [insensitive(ModuleMethods.ReferralsReserve)]: () => Operation.ReferralReserveXor,
    [insensitive(ModuleMethods.ReferralsUnreserve)]: () => Operation.ReferralUnreserveXor,
  },
  [insensitive(ModuleNames.PswapDistribution)]: {
    [insensitive(ModuleMethods.PswapDistributionClaimIncentive)]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.Rewards)]: {
    [insensitive(ModuleMethods.RewardsClaim)]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.VestedRewards)]: {
    [insensitive(ModuleMethods.VestedRewardsClaimRewards)]: () => Operation.ClaimRewards,
    [insensitive(ModuleMethods.VestedRewardsClaimCrowdloanRewards)]: () => Operation.ClaimRewards,
  },
  [insensitive(ModuleNames.DemeterFarming)]: {
    [insensitive(ModuleMethods.DemeterFarmingDeposit)]: (data: HistoryElementDemeterFarming) => {
      return data.isFarm ? Operation.DemeterFarmingDepositLiquidity : Operation.DemeterFarmingStakeToken;
    },
    [insensitive(ModuleMethods.DemeterFarmingWithdraw)]: (data: HistoryElementDemeterFarming) => {
      return data.isFarm ? Operation.DemeterFarmingWithdrawLiquidity : Operation.DemeterFarmingUnstakeToken;
    },
    [insensitive(ModuleMethods.DemeterFarmingGetRewards)]: () => Operation.DemeterFarmingGetRewards,
  },
  [insensitive(ModuleNames.OrderBook)]: {
    [insensitive(ModuleMethods.OrderBookPlaceLimitOrder)]: () => Operation.OrderBookPlaceLimitOrder,
    [insensitive(ModuleMethods.OrderBookCancelLimitOrder)]: () => Operation.OrderBookCancelLimitOrder,
    [insensitive(ModuleMethods.OrderBookCancelLimitOrders)]: () => Operation.OrderBookCancelLimitOrders,
  },
};

const getAssetSymbol = (asset: Nullable<Asset | WhitelistItem>): string => asset?.symbol ?? '';

const getTransactionId = (tx: HistoryElement): string => tx.id;

const isModuleMethod = (item: HistoryElementBatchCall, module: string, method: string) =>
  insensitive(item.module) === insensitive(module) && insensitive(item.method) === insensitive(method);

const getBatchCall = (calls: HistoryElementBatchCall[], { module, method }): Nullable<HistoryElementBatchCall> =>
  calls.find((item) => isModuleMethod(item, module, method));

const getTransactionOperationType = (tx: HistoryElement): Nullable<Operation> => {
  const { module, method, data, calls } = tx;

  const operationGetter = getOr(ObjectInit, [insensitive(module), insensitive(method)], OperationsMap);

  return operationGetter((data as any) || calls);
};

const getTransactionTimestamp = (tx: HistoryElement): number => {
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

const getTransactionStatus = (tx: HistoryElement): string => {
  if (tx.execution.success) return TransactionStatus.Finalized;

  return TransactionStatus.Error;
};

const getTransactionNetworkFee = (tx: HistoryElement): string => {
  const fromCodec = FPNumber.fromCodecValue(tx.networkFee);
  const minFee = new FPNumber('0.0007');

  if (FPNumber.isLessThan(fromCodec, minFee)) {
    return new FPNumber(tx.networkFee).toCodecString();
  } else {
    return tx.networkFee;
  }
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

const logOperationDataParsingError = (operation: Operation, transaction: HistoryElement): void => {
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

const parseMintOrBurn = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementAssetBurn;

  const assetAddress = data.assetId;
  const asset = await getAssetByAddress(assetAddress);

  payload.amount = data.amount;
  payload.symbol = getAssetSymbol(asset);

  return payload;
};

const parseSwapTransfer = async (transaction: HistoryElement, payload: HistoryItem) => {
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

  return payload;
};

const parseSwapTransferBatch = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementSwapTransferBatch;

  // [INDEXERS]: remove after full reindex
  if (!data.receivers) {
    const transfer = data as unknown as HistoryElementTransfer;
    const assetAddress = transfer.assetId;
    const asset = await getAssetByAddress(assetAddress);

    payload.assetAddress = assetAddress;
    payload.symbol = getAssetSymbol(asset);
    payload.amount = transfer.amount;

    return payload;
  }

  const inputAssetId = data.inputAssetId ?? data.assetId;
  const inputAsset = await getAssetByAddress(inputAssetId);

  payload.assetAddress = inputAssetId;
  payload.liquiditySource = data.selectedMarket;
  payload.amount = data.inputAmount;
  payload.symbol = getAssetSymbol(inputAsset);

  payload.payload = {};
  payload.payload.adarFee = data.adarFee;
  payload.payload.actualFee = data.actualFee;
  payload.payload.maxInputAmount = data.maxInputAmount;
  payload.payload.receivers = [];

  const transfers = data.transfers;

  // [INDEXERS]: remove after full reindex
  if (Array.isArray(transfers) && transfers.length > 0) {
    for (const receiver of data.receivers) {
      const batch = receiver as any;
      const assetAddress = batch.outcomeAssetId?.code;
      const asset = await getAssetByAddress(assetAddress);

      for (const receiver of batch.receivers) {
        payload.payload.receivers.push({
          accountId: receiver.accountId,
          asset,
          amount: FPNumber.fromCodecValue(receiver.targetAmount, asset?.decimals).toString(),
          symbol: getAssetSymbol(asset),
        });
      }
    }
  } else {
    for (const receiver of data.receivers) {
      const asset = await getAssetByAddress(receiver.assetId);

      payload.payload.receivers.push({
        accountId: receiver.accountId,
        asset,
        amount: receiver.amount,
        symbol: getAssetSymbol(asset),
      });
    }
  }

  return payload;
};

const parseLiquidityDepositOrWithdrawal = async (transaction: HistoryElement, payload: HistoryItem) => {
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
};

const parseCreatePair = async (transaction: HistoryElement, payload: HistoryItem) => {
  const calls = transaction.calls;
  const call = getBatchCall(calls, {
    module: ModuleNames.PoolXYK,
    method: ModuleMethods.PoolXYKDepositLiquidity,
  });

  if (!call) return null;

  const assetAddress = call.data.inputAssetA ?? call.data.input_asset_a;
  const asset2Address = call.data.inputAssetB ?? call.data.input_asset_b;
  const amount = call.data.inputADesired ?? call.data.input_a_desired;
  const amount2 = call.data.inputBDesired ?? call.data.input_b_desired;

  const asset = await getAssetByAddress(assetAddress as string);
  const asset2 = await getAssetByAddress(asset2Address as string);

  payload.assetAddress = asset ? (assetAddress as string) : '';
  payload.asset2Address = asset2 ? (asset2Address as string) : '';
  payload.symbol = getAssetSymbol(asset);
  payload.symbol2 = getAssetSymbol(asset2);
  payload.amount = String(amount);
  payload.amount2 = String(amount2);

  return payload;
};

const parseTransfer = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementTransfer;
  const _payload = payload as HistoryXorlessTransfer;

  const assetAddress = data.assetId;
  const asset = await getAssetByAddress(assetAddress);

  _payload.assetAddress = assetAddress;
  _payload.symbol = getAssetSymbol(asset);
  _payload.amount = data.amount;
  _payload.assetFee = data.assetFee;
  _payload.xorFee = data.xorFee;
  _payload.comment = data.comment;

  return payload;
};

const parseRegisterAsset = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementAssetRegistration;

  const assetAddress = data.assetId;
  const asset = await getAssetByAddress(assetAddress);

  payload.symbol = getAssetSymbol(asset);

  return payload;
};

const parseReferralReserve = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementReferrerReserve;
  payload.amount = data.amount;
  return payload;
};

const parseClaimRewards = async (transaction: HistoryElement, payload: HistoryItem) => {
  const rewardsData =
    transaction.module === ModuleNames.Utility ? [] : (transaction.data as HistoryElementRewardsClaim);

  (payload as RewardClaimHistory).rewards = Array.isArray(rewardsData) ? await formatRewards(rewardsData) : [];

  return payload;
};

const parseDemeterLiquidity = async (transaction: HistoryElement, payload: HistoryItem) => {
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
};

const parseDemeterStakeOrRewards = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementDemeterFarming;

  const assetAddress = data.assetId;
  const asset = await getAssetByAddress(assetAddress);

  payload.assetAddress = assetAddress;
  payload.symbol = getAssetSymbol(asset);
  payload.amount = data.amount;

  return payload;
};

const parseOrderBookLimitOrderPlacement = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementPlaceLimitOrder;

  const _payload = payload as LimitOrderHistory;
  const baseAssetId = data.baseAssetId;
  const quoteAssetId = data.quoteAssetId;
  const baseAsset = await getAssetByAddress(baseAssetId);
  const quoteAsset = await getAssetByAddress(quoteAssetId);

  _payload.assetAddress = baseAssetId;
  _payload.asset2Address = quoteAssetId;
  _payload.symbol = getAssetSymbol(baseAsset);
  _payload.symbol2 = getAssetSymbol(quoteAsset);
  _payload.price = new FPNumber(data.price).toString();
  _payload.amount = new FPNumber(data.amount).toString();
  _payload.side = data.side;
  _payload.limitOrderTimestamp = data.lifetime;

  return payload;
};

const parseOrderBookLimitOrderCancel = async (transaction: HistoryElement, payload: HistoryItem) => {
  const data = transaction.data as HistoryElementCancelLimitOrder;

  const _payload = payload as LimitOrderHistory;
  const baseAssetId = data[0].baseAssetId;
  const quoteAssetId = data[0].quoteAssetId;
  const baseAsset = await getAssetByAddress(baseAssetId);
  const quoteAsset = await getAssetByAddress(quoteAssetId);

  _payload.assetAddress = baseAssetId;
  _payload.asset2Address = quoteAssetId;
  _payload.symbol = getAssetSymbol(baseAsset);
  _payload.symbol2 = getAssetSymbol(quoteAsset);
  _payload.limitOrderIds = data.map((order) => order.orderId);

  return payload;
};

export default class IndexerDataParser {
  // Operations visible in wallet
  public static readonly SUPPORTED_OPERATIONS = [
    Operation.Burn,
    Operation.Mint,
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
    return IndexerDataParser.SUPPORTED_OPERATIONS;
  }

  public async parseTransactionAsHistoryItem(transaction: HistoryElement): Promise<Nullable<HistoryItem>> {
    const type = getTransactionOperationType(transaction);

    if (!type) return null;

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
      soraNetworkFee: getTransactionNetworkFee(transaction),
      status: getTransactionStatus(transaction),
    };

    payload.from = transaction.dataFrom ?? transaction.address;
    payload.to = transaction.dataTo;

    if (transaction.execution.error) {
      const { name, section } = getErrorMessage(transaction.execution.error);

      payload.errorMessage = {
        section,
        name,
      };
    }

    switch (type) {
      case Operation.Burn:
      case Operation.Mint: {
        return await parseMintOrBurn(transaction, payload);
      }
      case Operation.Swap:
      case Operation.SwapAndSend: {
        return await parseSwapTransfer(transaction, payload);
      }
      case Operation.SwapTransferBatch: {
        return await parseSwapTransferBatch(transaction, payload);
      }
      case Operation.AddLiquidity:
      case Operation.RemoveLiquidity: {
        return await parseLiquidityDepositOrWithdrawal(transaction, payload);
      }
      case Operation.CreatePair: {
        return await parseCreatePair(transaction, payload);
      }
      case Operation.Transfer: {
        return await parseTransfer(transaction, payload);
      }
      case Operation.RegisterAsset: {
        return await parseRegisterAsset(transaction, payload);
      }
      case Operation.ReferralSetInvitedUser: {
        return payload;
      }
      case Operation.ReferralReserveXor:
      case Operation.ReferralUnreserveXor: {
        return await parseReferralReserve(transaction, payload);
      }
      case Operation.ClaimRewards: {
        return await parseClaimRewards(transaction, payload);
      }
      case Operation.DemeterFarmingDepositLiquidity:
      case Operation.DemeterFarmingWithdrawLiquidity: {
        return await parseDemeterLiquidity(transaction, payload);
      }
      case Operation.DemeterFarmingStakeToken:
      case Operation.DemeterFarmingUnstakeToken:
      case Operation.DemeterFarmingGetRewards: {
        return await parseDemeterStakeOrRewards(transaction, payload);
      }
      case Operation.OrderBookPlaceLimitOrder: {
        return await parseOrderBookLimitOrderPlacement(transaction, payload);
      }
      case Operation.OrderBookCancelLimitOrder:
      case Operation.OrderBookCancelLimitOrders: {
        return await parseOrderBookLimitOrderCancel(transaction, payload);
      }
      default:
        return null;
    }
  }
}
