import { FPNumber, Operation, TransactionStatus, HistoryItem } from '@sora-substrate/util';
import { RewardingEvents } from '@sora-substrate/util/build/rewards/consts';
import { BN } from '@polkadot/util';
import getOr from 'lodash/fp/getOr';
import type { Asset } from '@sora-substrate/util/build/assets/types';
import type { RewardClaimHistory, RewardInfo } from '@sora-substrate/util/build/rewards/types';

import store from '../../store';
import { api } from '../../api';
import { ModuleNames, ModuleMethods } from './types';
import type {
  ExplorerDataParser,
  HistoryElement,
  HistoryElementError,
  HistoryElementSwap,
  HistoryElementSwapTransfer,
  HistoryElementLiquidityOperation,
  HistoryElementTransfer,
  HistoryElementAssetRegistration,
  HistoryElementRewardsClaim,
  UtilityBatchAllItem,
  ReferralSetReferrer,
  ReferrerReserve,
  ClaimedRewardItem,
} from './types';

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
  },
  [insensitive(ModuleNames.Utility)]: {
    [ModuleMethods.UtilityBatchAll]: (data: UtilityBatchAllItem[]) => {
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
};

const getAssetSymbol = (asset: Nullable<Asset>): string => (asset && asset.symbol ? asset.symbol : '');

const getTransactionId = (tx: HistoryElement): string => tx.id;

const emptyFn = () => null;

const isModuleMethod = (item: UtilityBatchAllItem, module: string, method: string) =>
  insensitive(item.module) === insensitive(module) && insensitive(item.method) === insensitive(method);

const getBatchCall = (data: Array<UtilityBatchAllItem>, { module, method }): Nullable<UtilityBatchAllItem> =>
  data.find((item) => isModuleMethod(item, module, method));

const getTransactionOperationType = (tx: HistoryElement): Nullable<Operation> => {
  const { module, method, data } = tx;

  const operationGetter = getOr(emptyFn, [insensitive(module), method], OperationsMap);

  return operationGetter(data);
};

const getTransactionTimestamp = (tx: HistoryElement): number => {
  const timestamp = tx.timestamp * 1000;

  return !Number.isNaN(timestamp) ? timestamp : Date.now();
};

const getErrorMessage = (historyElementError: HistoryElementError): string => {
  try {
    const [error, index] = [new BN(historyElementError.moduleErrorId), new BN(historyElementError.moduleErrorIndex)];
    const { documentation } = api.api.registry.findMetaError({ error, index });

    return documentation.join(' ').trim();
  } catch (error) {
    console.error(historyElementError, error);
    return '';
  }
};

const getTransactionStatus = (tx: HistoryElement): string => {
  if (tx.execution.success) return TransactionStatus.Finalized;

  return TransactionStatus.Error;
};

const getAssetByAddress = async (address: string): Promise<Nullable<Asset>> => {
  try {
    if (address in store.getters.whitelist) {
      return { ...store.getters.whitelist[address], address };
    }
    return await api.assets.getAssetInfo(address);
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
        type: RewardingEvents.Unspecified,
      });
    }
  }

  return formatted;
};

export default class SubqueryDataParser implements ExplorerDataParser {
  // Operations visible in wallet
  public static SUPPORTED_OPERATIONS = [
    Operation.Transfer,
    Operation.Swap,
    Operation.SwapAndSend,
    Operation.CreatePair,
    Operation.AddLiquidity,
    Operation.RemoveLiquidity,
    Operation.RegisterAsset,
    Operation.ReferralSetInvitedUser,
    Operation.ReferralReserveXor,
    Operation.ReferralUnreserveXor,
    Operation.ClaimRewards,
  ];

  public get supportedOperations(): Array<Operation> {
    return SubqueryDataParser.SUPPORTED_OPERATIONS;
  }

  public async parseTransactionAsHistoryItem(transaction: HistoryElement): Promise<Nullable<HistoryItem>> {
    const type = getTransactionOperationType(transaction);

    if (!type) return null;

    if (!transaction.data) {
      logOperationDataParsingError(type, transaction);
      return null;
    }

    const id = getTransactionId(transaction);
    const timestamp = getTransactionTimestamp(transaction);
    const blockHeight = transaction.blockHeight;
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
      soraNetworkFee: new FPNumber(transaction.networkFee).toCodecString(),
      status: getTransactionStatus(transaction),
    };

    if (transaction.execution.error) {
      const message = getErrorMessage(transaction.execution.error);

      if (message) {
        payload.errorMessage = message;
      }
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
        const data = transaction.data as UtilityBatchAllItem[];
        const call = getBatchCall(data, { module: ModuleNames.PoolXYK, method: ModuleMethods.PoolXYKDepositLiquidity });

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

        payload.assetAddress = asset ? asset.address : '';
        payload.asset2Address = asset2 ? asset2.address : '';
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
          transaction.module === ModuleNames.Utility
            ? (transaction.data as UtilityBatchAllItem[])[0].data.rewards
            : (transaction.data as HistoryElementRewardsClaim);

        if (Array.isArray(rewardsData)) {
          (payload as RewardClaimHistory).rewards = await formatRewards(rewardsData);
        }

        return payload;
      }
      default:
        return null;
    }
  }
}
