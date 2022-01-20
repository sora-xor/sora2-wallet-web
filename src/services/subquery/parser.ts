import { FPNumber, Operation, TransactionStatus, History } from '@sora-substrate/util';
import { BN } from '@polkadot/util';
import getOr from 'lodash/fp/getOr';
import type { Asset } from '@sora-substrate/util/build/assets/types';

import store from '../../store';
import { api } from '../../api';
import { ModuleNames, ModuleMethods } from '../types';
import type {
  ExplorerDataParser,
  HistoryElement,
  HistoryElementError,
  HistoryElementSwap,
  HistoryElementLiquidityOperation,
  HistoryElementTransfer,
  HistoryElementAssetRegistration,
  UtilityBatchAllItem,
  ReferrerSetReferrer,
  ReferrerReserve,
} from '../types';

const OperationsMap = {
  [ModuleNames.Assets]: {
    [ModuleMethods.AssetsRegister]: () => Operation.RegisterAsset,
    [ModuleMethods.AssetsTransfer]: () => Operation.Transfer,
  },
  [ModuleNames.PoolXYK]: {
    [ModuleMethods.PoolXYKDepositLiquidity]: () => Operation.AddLiquidity,
    [ModuleMethods.PoolXYKWithdrawLiquidity]: () => Operation.RemoveLiquidity,
  },
  [ModuleNames.LiquidityProxy]: {
    [ModuleMethods.LiquidityProxySwap]: () => Operation.Swap,
  },
  [ModuleNames.Utility]: {
    [ModuleMethods.UtilityBatchAll]: (data: HistoryElement['data']) => {
      if (
        Array.isArray(data) &&
        !!getBatchCall(data, { module: ModuleNames.PoolXYK, method: ModuleMethods.PoolXYKInitializePool }) &&
        !!getBatchCall(data, { module: ModuleNames.PoolXYK, method: ModuleMethods.PoolXYKDepositLiquidity })
      ) {
        return Operation.CreatePair;
      }
      return null;
    },
  },
  [ModuleNames.Referrals]: {
    [ModuleMethods.ReferralsSetReferrer]: () => Operation.ReferralSetInvitedUser,
    [ModuleMethods.ReferralsReserve]: () => Operation.ReferralReserveXor,
    [ModuleMethods.ReferralsUnreserve]: () => Operation.ReferralUnreserveXor,
  },
};

const getAssetSymbol = (asset: Nullable<Asset>): string => (asset && asset.symbol ? asset.symbol : '');

const getTransactionId = (tx: HistoryElement): string => tx.id;

const emptyFn = () => null;

const getBatchCall = (data: Array<UtilityBatchAllItem>, { module, method }): Nullable<UtilityBatchAllItem> =>
  data.find((item) => item.module === module && item.method === method);

const getTransactionOperationType = (tx: HistoryElement): Nullable<Operation> => {
  const { module, method, data } = tx;

  const operationGetter = getOr(emptyFn, [module, method], OperationsMap);

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

const getAssetByAddress = async (address: string): Promise<Asset> => {
  if (address in store.getters.whitelist) {
    return store.getters.whitelist[address];
  }
  return await api.assets.getAssetInfo(address);
};

const logOperationDataParsingError = (operation: Operation, transaction: HistoryElement): void => {
  console.error(`Couldn't parse ${operation} data.`, transaction);
};

export default class SubqueryDataParser implements ExplorerDataParser {
  public static SUPPORTED_OPERATIONS = [
    Operation.Transfer,
    Operation.Swap,
    Operation.CreatePair,
    Operation.AddLiquidity,
    Operation.RemoveLiquidity,
    Operation.RegisterAsset,
    Operation.ReferralSetInvitedUser,
    Operation.ReferralReserveXor,
    Operation.ReferralUnreserveXor,
  ];

  public get supportedOperations(): Array<Operation> {
    return SubqueryDataParser.SUPPORTED_OPERATIONS;
  }

  public async parseTransactionAsHistoryItem(transaction: HistoryElement): Promise<Nullable<History>> {
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
    const payload: History = {
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
      case Operation.Swap: {
        const data = transaction.data as HistoryElementSwap;

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

        payload.assetAddress = asset.address;
        payload.asset2Address = asset2.address;
        payload.symbol = getAssetSymbol(asset);
        payload.symbol2 = getAssetSymbol(asset2);
        payload.amount = FPNumber.fromCodecValue(amount).toString();
        payload.amount2 = FPNumber.fromCodecValue(amount2).toString();

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
      // TODO: wait for Subquery support:
      // Operation.Rewards
      // utility.batch
      case Operation.ReferralSetInvitedUser: {
        const data = transaction.data as ReferrerSetReferrer;
        payload.to = data.referrer;
        return payload;
      }
      case Operation.ReferralReserveXor: {
        const data = transaction.data as ReferrerReserve;
        payload.amount = data.amount;
        return payload;
      }
      case Operation.ReferralUnreserveXor: {
        const data = transaction.data as ReferrerReserve;
        payload.amount = data.amount;
        return payload;
      }
      default:
        return null;
    }
  }
}
