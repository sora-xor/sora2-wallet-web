import getOr from 'lodash/fp/getOr';
import omit from 'lodash/fp/omit';
import { BN } from '@polkadot/util';
import { FPNumber, Operation, TransactionStatus, HistoryItem } from '@sora-substrate/util';
import { RewardingEvents } from '@sora-substrate/util/build/rewards/consts';
import type { Asset, WhitelistItem } from '@sora-substrate/util/build/assets/types';
import type { RewardClaimHistory, RewardInfo } from '@sora-substrate/util/build/rewards/types';
import type { TranslateResult } from 'vue-i18n';

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
  HistoryElementUtilityBatchAll,
  HistoryElementDemeterFarming,
  UtilityBatchCall,
  ReferralSetReferrer,
  ReferrerReserve,
  ClaimedRewardItem,
  ExtrinsicEvent,
} from './types';
import { SubstrateEvents } from './consts';
import i18n from '../../lang';

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
    [ModuleMethods.UtilityBatchAll]: (data: HistoryElementUtilityBatchAll) => {
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
};

const getAssetSymbol = (asset: Nullable<Asset | WhitelistItem>): string => (asset && asset.symbol ? asset.symbol : '');

const getTransactionId = (tx: HistoryElement): string => tx.id;

const emptyFn = () => null;

const isModuleMethod = (item: UtilityBatchCall, module: string, method: string) =>
  insensitive(item.module) === insensitive(module) && insensitive(item.method) === insensitive(method);

const getBatchCall = (calls: Array<UtilityBatchCall>, { module, method }): Nullable<UtilityBatchCall> =>
  calls.find((item) => isModuleMethod(item, module, method));

const getTransactionOperationType = (tx: HistoryElement): Nullable<Operation> => {
  const { module, method, data } = tx;

  const operationGetter = getOr(emptyFn, [insensitive(module), method], OperationsMap);

  return operationGetter(data);
};

const getTransactionTimestamp = (tx: HistoryElement): number => {
  const timestamp = tx.timestamp * 1000;

  return !Number.isNaN(timestamp) ? timestamp : Date.now();
};

// TODO: Remove to substrate-js
function getFormattedMessage(errorIndex: number, section: string) {
  const generalError = 'Something went wrong';
  switch (section) {
    case 'poolXyk':
      return poolXYKErrorMessages[errorIndex] ? poolXYKErrorMessages[errorIndex] : generalError;
    default:
      return generalError;
  }
}

const poolXYKErrorMessages = {
  6: 'Source balance is not large enough',
  32: 'Source balance of liquidity is not large enough',
  44: 'This is error', // add liquidity
  55: 'XOR lower than the minimum value (0.007)',
};

const farmingErrorMessages = {
  // Add errors
};

const getErrorMessage = (historyElementError: HistoryElementError): string => {
  try {
    const [error, index] = [new BN(historyElementError.moduleErrorId), new BN(historyElementError.moduleErrorIndex)];
    const { index: indexError, section } = api.api.registry.findMetaError({ error, index });
    let errMessage = i18n.t(`historyErrorMessages.generalError`) as string;

    if (indexError > -1 && section) {
      errMessage = i18n.t(`historyErrorMessages.${section}.${indexError}`) as string;
      console.log('errMessage, indexError', errMessage, indexError);
      if (errMessage.startsWith('historyErrorMessages')) {
        return i18n.t(`historyErrorMessages.generalError`) as string;
      }
    }

    return errMessage as string;
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
    if (address in store.getters.wallet.account.whitelist) {
      const whitelistData = omit(['icon'], store.getters.wallet.account.whitelist[address]);
      return { ...whitelistData, address };
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

const getRewardsFromEvents = (events: ExtrinsicEvent[]): ClaimedRewardItem[] => {
  return events.reduce<ClaimedRewardItem[]>((buffer, event) => {
    if (
      event.method === SubstrateEvents.CurrenciesTransferred.method &&
      event.section === SubstrateEvents.CurrenciesTransferred.section
    ) {
      const [assetId, from, to, amount] = event.data;

      buffer.push({
        assetId,
        amount,
      });
    }
    return buffer;
  }, []);
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
    Operation.DemeterFarmingDepositLiquidity,
    Operation.DemeterFarmingWithdrawLiquidity,
    Operation.DemeterFarmingStakeToken,
    Operation.DemeterFarmingUnstakeToken,
    Operation.DemeterFarmingGetRewards,
  ];

  public get supportedOperations(): Array<Operation> {
    return SubqueryDataParser.SUPPORTED_OPERATIONS;
  }

  public async parseTransactionAsHistoryItem(transaction: HistoryElement): Promise<Nullable<HistoryItem>> {
    const type = getTransactionOperationType(transaction);

    if (!type) return null;

    // rewards transaction data could be nullable
    if (!transaction.data && type !== Operation.ClaimRewards) {
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
        const data = transaction.data as HistoryElementUtilityBatchAll;
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
      default:
        return null;
    }
  }
}
