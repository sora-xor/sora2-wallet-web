import { FPNumber, Operation, TransactionStatus, History, Asset } from '@sora-substrate/util';
import { BN } from '@polkadot/util';

import store from '../../store';
import { api } from '../../api';
import type {
  ExplorerDataParser,
  HistoryElement,
  HistoryElementError,
  HistoryElementSwap,
  HistoryElementLiquidityOperation,
  HistoryElementTransfer,
  HistoryElementAssetRegistration,
} from '../types';

enum ModuleCallOperation {
  RegisterPair = 'registerPair',
  InitializePool = 'initializePool',
}

enum ModuleNames {
  Assets = 'assets',
  LiquidityProxy = 'liquidityProxy',
  Rewards = 'rewards',
  PoolXYK = 'poolXyk',
  TradingPair = 'tradingPair',
  Utility = 'utility',
}

const OperationByModuleCall = {
  [ModuleNames.Assets]: {
    transfer: Operation.Transfer,
    register: Operation.RegisterAsset,
  },
  [ModuleNames.LiquidityProxy]: {
    swap: Operation.Swap,
  },
  [ModuleNames.PoolXYK]: {
    depositLiquidity: Operation.AddLiquidity,
    withdrawLiquidity: Operation.RemoveLiquidity,
    initializePool: ModuleCallOperation.InitializePool,
  },
  [ModuleNames.TradingPair]: {
    register: ModuleCallOperation.RegisterPair,
  },
};

const getTransactionId = (tx: HistoryElement): string => tx.id;

const getTransactionOperationType = (tx: HistoryElement): Nullable<Operation> => {
  const { module, method } = tx;

  if (!(module in OperationByModuleCall)) return null;
  if (!(method in OperationByModuleCall[module])) return null;

  return OperationByModuleCall[module][method];
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
  return await api.getAssetInfo(address);
};

const logOperationDataParsingError = (operation: Operation, transaction: HistoryElement): void => {
  console.error(`Couldn't parse ${operation} data.`, transaction);
};

export default class SubqueryDataParser implements ExplorerDataParser {
  public static SUPPORTED_OPERATIONS = [
    Operation.Transfer,
    Operation.Swap,
    Operation.AddLiquidity,
    Operation.RemoveLiquidity,
    Operation.RegisterAsset,
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
        payload.symbol = asset && asset.symbol ? asset.symbol : '';
        payload.symbol2 = asset2 && asset2.symbol ? asset2.symbol : '';
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
        payload.symbol = asset && asset.symbol ? asset.symbol : '';
        payload.symbol2 = asset2 && asset2.symbol ? asset2.symbol : '';
        payload.amount = data.baseAssetAmount;
        payload.amount2 = data.targetAssetAmount;

        return payload;
      }
      case Operation.Transfer: {
        const data = transaction.data as HistoryElementTransfer;

        const assetAddress = data.assetId;
        const asset = await getAssetByAddress(assetAddress);

        payload.assetAddress = assetAddress;
        payload.symbol = asset && asset.symbol ? asset.symbol : '';
        payload.to = data.to;
        payload.amount = data.amount;

        return payload;
      }
      case Operation.RegisterAsset: {
        const data = transaction.data as HistoryElementAssetRegistration;

        const assetAddress = data.assetId;
        const asset = await getAssetByAddress(assetAddress);

        payload.symbol = asset && asset.symbol ? asset.symbol : '';

        return payload;
      }
      // TODO: wait for Subquery support:
      // Operation.Rewards
      // utility.batch
      default:
        return null;
    }
  }
}
