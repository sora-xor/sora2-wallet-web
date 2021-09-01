
import { api, FPNumber, Operation, TransactionStatus, History } from '@sora-substrate/util'

import { ExplorerDataParser } from '../types'

enum ModuleCallOperation {
  RegisterPair = 'registerPair',
  InitializePool = 'initializePool'
}

enum ModuleNames {
  Assets = 'assets',
  LiquidityProxy = 'liquidityProxy',
  Rewards = 'rewards',
  PoolXYK = 'poolXyk',
  TradingPair = 'tradingPair',
  Utility = 'utility'
}

const OperationByModuleCall = {
  [ModuleNames.Assets]: {
    transfer: Operation.Transfer,
    register: Operation.RegisterAsset
  },
  [ModuleNames.LiquidityProxy]: {
    swap: Operation.Swap
  },
  [ModuleNames.PoolXYK]: {
    depositLiquidity: Operation.AddLiquidity,
    withdrawLiquidity: Operation.RemoveLiquidity,
    initializePool: ModuleCallOperation.InitializePool
  },
  [ModuleNames.TradingPair]: {
    register: ModuleCallOperation.RegisterPair
  }
}

const getTransactionId = (tx: any): string => tx.id

const getTransactionOperationType = (tx: any): Operation => {
  const { module, method } = tx

  return OperationByModuleCall[module]?.[method] ?? ''
}

const getTransactionTimestamp = (tx: any) => {
  const timestamp = Date.parse(tx.timestamp)

  return !Number.isNaN(timestamp) ? timestamp : Date.now()
}

const getTransactionStatus = (tx: any): string => {
  if (tx.success) return TransactionStatus.Finalized

  return TransactionStatus.Error
}

export default class SubqueryDataParser implements ExplorerDataParser {
  public static SUPPORTED_OPERATIONS = [
    Operation.Transfer,
    Operation.Swap,
    Operation.AddLiquidity,
    Operation.RemoveLiquidity
  ]

  public get supportedOperations (): Array<Operation> {
    return SubqueryDataParser.SUPPORTED_OPERATIONS
  }

  public async parseTransactionAsHistoryItem (transaction): Promise<History | null> {
    const id = getTransactionId(transaction)
    const type = getTransactionOperationType(transaction)
    const timestamp = getTransactionTimestamp(transaction)
    const blockHeight = transaction.blockHeight
    // TODO: add to subquery blockId

    // common attributes
    const payload: History = {
      id, // history item id will be txId
      type,
      txId: id,
      blockHeight,
      endTime: timestamp,
      startTime: timestamp,
      from: transaction.address,
      soraNetworkFee: new FPNumber(transaction.networkFee).toCodecString(),
      status: getTransactionStatus(transaction)
    }

    // TODO: if Subquery will support error message, add it
    // if (transaction.errorMessage) {
    //   payload.errorMessage = transaction.errorMessage
    // }

    switch (type) {
      case Operation.Swap: {
        const assetAddress = transaction.swap.baseAssetId
        const asset2Address = transaction.swap.targetAssetId
        const asset = await api.getAssetInfo(assetAddress)
        const asset2 = await api.getAssetInfo(asset2Address)

        payload.assetAddress = assetAddress
        payload.asset2Address = asset2Address
        payload.amount = transaction.swap.baseAssetAmount
        payload.amount2 = transaction.swap.targetAssetAmount
        payload.symbol = asset?.symbol ?? ''
        payload.symbol2 = asset2?.symbol ?? ''
        payload.liquiditySource = transaction.swap.selectedMarket
        payload.liquidityProviderFee = new FPNumber(transaction.swap.liquidityProviderFee).toCodecString()

        return payload
      }
      case Operation.AddLiquidity:
      case Operation.RemoveLiquidity: {
        const assetAddress = transaction.liquidityOperation.baseAssetId
        const asset2Address = transaction.liquidityOperation.targetAssetId
        const asset = await api.getAssetInfo(assetAddress)
        const asset2 = await api.getAssetInfo(asset2Address)

        payload.assetAddress = assetAddress
        payload.asset2Address = asset2Address
        payload.symbol = asset?.symbol ?? ''
        payload.symbol2 = asset2?.symbol ?? ''
        payload.amount = transaction.liquidityOperation.baseAssetAmount
        payload.amount2 = transaction.liquidityOperation.targetAssetAmount

        return payload
      }
      case Operation.Transfer: {
        const assetAddress = transaction.transfer.assetId
        const asset = await api.getAssetInfo(assetAddress)

        payload.assetAddress = assetAddress
        payload.symbol = asset?.symbol ?? ''
        payload.to = transaction.transfer.to
        payload.amount = transaction.transfer.amount

        return payload
      }
      // TODO: wait for Subquery support:
      // Operation.Rewards
      // Operation.RegisterAsset
      // utility.batch
      default:
        return null
    }
  }
}
