import {
  SubqueryAccountEntity,
  SubqueryAssetEntity,
  SubqueryOrderBookEntity,
  SubqueryOrderBookSnapshotEntity,
  SubqueryOrderBookOrderEntity,
  SubqueryPoolXYKEntity,
} from '../subquery/types';
import {
  SubsquidAccountEntity,
  SubsquidAssetEntity,
  SubsquidOrderBookEntity,
  SubsquidOrderBookSnapshotEntity,
  SubsquidOrderBookOrderEntity,
  SubsquidPoolXYKEntity,
} from '../subsquid/types';

import type { PriceVariant, OrderBookStatus } from '@sora-substrate/liquidity-proxy';
import type { CodecString } from '@sora-substrate/util';
import type { StakingRewardsDestination } from '@sora-substrate/util/build/staking/types';

// Indexer Enums
export enum SnapshotTypes {
  DEFAULT = 'DEFAULT',
  HOUR = 'HOUR',
  DAY = 'DAY',
  MONTH = 'MONTH',
}

export enum OrderStatus {
  Active = 'Active',
  Aligned = 'Aligned',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Filled = 'Filled',
}

export enum OrderType {
  Limit = 'Limit',
  Market = 'Market',
}

// Indexer Models
/* eslint-disable camelcase */

export type PriceSnapshot = {
  low: string;
  high: string;
  open: string;
  close: string;
};

export type AssetVolume = {
  amount: string;
  amountUSD: string;
};

export type AccountBaseEntity = {
  id: string;
};

export type AssetBaseEntity = {
  id: string;
  priceUSD: string;
  supply: CodecString;
  liquidity?: CodecString; // in pools
  liquidityBooks?: CodecString; // in order books
  priceChangeDay?: number;
  priceChangeWeek?: number;
  volumeDayUSD?: number;
  volumeWeekUSD?: number;
  velocity?: number;
};

export type AssetSnapshotBaseEntity = {
  id: string;
  assetId: string;
  timestamp: number;
  type: SnapshotTypes;
  supply: CodecString;
  mint: CodecString;
  burn: CodecString;
  priceUSD: PriceSnapshot;
  volume: AssetVolume;
};

export type PoolXYKBaseEntity = {
  id: string;
  baseAssetReserves: CodecString;
  targetAssetReserves: CodecString;
  multiplier: number;
  priceUSD: Nullable<string>;
  strategicBonusApy: Nullable<string>;
};

export type NetworkStatsEntity = {
  id: string;
  totalFees: CodecString;
  totalAccounts: number;
  totalTransactions: number;
  totalBridgeIncomingTransactions: number;
  totalBridgeOutgoingTransactions: number;
};

export type NetworkSnapshotEntity = {
  id: string;
  type: SnapshotTypes;
  timestamp: number;
  accounts: number;
  transactions: number;
  fees: CodecString;
  liquidityUSD: string;
  volumeUSD: string;
  bridgeIncomingTransactions: number;
  bridgeOutgoingTransactions: number;
};

export type OrderBookDealEntity = {
  orderId: number;
  timestamp: number;
  isBuy: boolean;
  amount: string;
  price: string;
};

export type OrderBookOrderBaseEntity = {
  id: string;
  type: OrderType;
  orderId: Nullable<number>;
  createdAtBlock: number;
  timestamp: number;
  isBuy: boolean;
  amount: string;
  price: string;
  lifetime: number;
  expiresAt: number;
  amountFilled: string;
  status: OrderStatus;
  updatedAtBlock: number;
};

export type OrderBookBaseEntity = {
  id: string;
  dexId: number;
  baseAssetReserves: CodecString;
  quoteAssetReserves: CodecString;
  status: OrderBookStatus;
  price?: string;
  priceChangeDay?: number;
  volumeDayUSD?: string;
  lastDeals?: string; // stringified JSON OrderBookDealEntity[]
  updatedAtBlock: number;
};

export type OrderBookSnapshotBaseEntity = {
  id: string;
  timestamp: number;
  type: SnapshotTypes;
  price: PriceSnapshot;
  baseAssetVolume: string;
  quoteAssetVolume: string;
  volumeUSD: string;
  liquidityUSD: string;
};

export type ReferrerRewardEntity = {
  id: string;
  referral: string;
  referrer: string;
  updated: number;
  amount: CodecString;
};
/* eslint-enable camelcase */

export type HistoryElementError = {
  moduleErrorId: number;
  moduleErrorIndex: number;
};

export type HistoryElementExecution = {
  success: boolean;
  error?: HistoryElementError;
};

export type HistoryElementSwap = {
  baseAssetAmount: string;
  baseAssetId: string;
  selectedMarket: string;
  targetAssetAmount: string;
  targetAssetId: string;
};

export type HistoryElementSwapTransfer = HistoryElementSwap & {
  to: string;
};

export type SwapTransferReceiver = {
  accountId: string;
  amount: string;
  assetId: string;
};

export type SwapTransferBatchTransferParam = {
  from: string;
  to: string;
  amount: string;
  assetId: string;
};

export type HistoryElementSwapTransferBatch = {
  assetId: string;
  selectedMarket: string;
  maxInputAmount: string;
  blockNumber: string;
  from: string;
  receivers: SwapTransferReceiver[];
  adarFee?: string;
  actualFee?: string;
  inputAmount?: string;
  comment?: string; // stringified JSON
  // outdated
  inputAssetId?: string;
  transfers?: SwapTransferBatchTransferParam[];
};

export type HistoryElementTransfer = {
  amount: string;
  assetId: string;
  from: string;
  to: string;
  assetFee?: string; // only in xorless transfer
  xorFee?: string; // only in xorless transfer
  comment?: string; // only in xorless transfer
};

export type HistoryElementLiquidityOperation = {
  baseAssetAmount: string;
  baseAssetId: string;
  targetAssetAmount: string;
  targetAssetId: string;
  type: string;
};

export type HistoryElementAssetRegistration = {
  assetId: string;
};

export type HistoryElementAssetBurn = {
  amount: string;
  assetId: string;
};

export type HistoryElementAssetMint = HistoryElementAssetBurn & {
  to: string;
};

export type HistoryElementDemeterFarming = {
  amount: string;
  assetId: string;
  isFarm: boolean;
  rewardAssetId?: string;
  baseAssetId?: string;
};

export type ClaimedRewardItem = {
  assetId: string;
  amount: string;
};

export type HistoryElementRewardsClaim = Nullable<ClaimedRewardItem[]>;

export type ExtrinsicEvent = {
  method: string;
  section: string;
  data: any[];
};

export type HistoryElementEthBridgeOutgoing = {
  amount: string;
  assetId: string;
  sidechainAddress: string;
  requestHash?: string;
};

export type HistoryElementEthBridgeIncoming = {
  amount: string;
  assetId: string;
  requestHash: string;
  to: string;
};

export type HistoryElementReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type HistoryElementReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type HistoryElementPlaceLimitOrder = {
  dexId: number;
  baseAssetId: string;
  quoteAssetId: string;
  orderId: number | undefined;
  price: string;
  amount: string;
  side: PriceVariant;
  lifetime: number | undefined;
};

export type HistoryElementCancelLimitOrder = Array<{
  dexId: number;
  baseAssetId: string;
  quoteAssetId: string;
  orderId: number;
}>;

export type HistoryElementStakingBondExtra = {
  amount: string;
};

export type HistoryElementStakingBond = HistoryElementStakingBondExtra & {
  controller: string;
  payee: {
    kind: StakingRewardsDestination;
    value?: string;
  };
};

export type HistoryElementStakingRebond = {
  value: string;
};

export type HistoryElementStakingUnbond = {
  amount: string;
};

export type HistoryElementStakingNominate = {
  targets: string[];
};

export type HistoryElementStakingWithdrawUnbonded = {
  amount: string;
  numSlashingSpans: number;
};

// [Staking] "staking.chill" call doesn't have any parameters
export type HistoryElementStakingChill = Record<string, never>;

export type HistoryElementStakingSetPayee = {
  payeeType: StakingRewardsDestination;
  payee: string;
};

export type HistoryElementStakingSetController = {
  controller: string;
};

export type HistoryElementStakingPayout = {
  validatorStash: string;
  era: number;
};

export type HistoryElementVaultCreate = {
  id?: string; // exists on success
  collateralAssetId: string;
  collateralAmount: string;
  debtAssetId: string;
  debtAmount: string;
};

export type HistoryElementVaultDepositCollateral = {
  id: string;
  collateralAssetId: string;
  collateralAmount: string;
};

export type HistoryElementVaultDebt = {
  id: string;
  debtAssetId: string;
  debtAmount: string;
};

export type HistoryElementVaultClose = Required<HistoryElementVaultCreate>;

export type HistoryElementDefiRIssueSBT = {
  description: string;
  externalurl: string;
  image: string;
  name: string;
  symbol: string;
};

export type HistoryElementDefiRSetSBTExpiration = {
  accountId: string;
  newExpiresAtTime: string;
  sbtAssetId: string;
};

export type HistoryElementDefiRRegulateAsset = {
  assetId: string;
};

export type HistoryElementDefiRBindRegulatedAssetToSbt = {
  assetId: string;
  sbtAssetId: string;
};

export type HistoryElementDataBase = Nullable<
  | HistoryElementReferralSetReferrer
  | HistoryElementReferrerReserve
  | HistoryElementSwap
  | HistoryElementSwapTransfer
  | HistoryElementSwapTransferBatch
  | HistoryElementTransfer
  | HistoryElementLiquidityOperation
  | HistoryElementAssetRegistration
  | HistoryElementEthBridgeOutgoing
  | HistoryElementEthBridgeIncoming
  | HistoryElementRewardsClaim
  | HistoryElementDemeterFarming
  | HistoryElementPlaceLimitOrder
  | HistoryElementCancelLimitOrder
  | HistoryElementStakingBond
  | HistoryElementStakingBondExtra
  | HistoryElementStakingRebond
  | HistoryElementStakingUnbond
  | HistoryElementStakingNominate
  | HistoryElementStakingWithdrawUnbonded
  | HistoryElementStakingChill
  | HistoryElementStakingSetPayee
  | HistoryElementStakingSetController
  | HistoryElementStakingPayout
  | HistoryElementVaultCreate
  | HistoryElementVaultDepositCollateral
  | HistoryElementVaultDebt
  | HistoryElementVaultClose
  | HistoryElementDefiRIssueSBT
  | HistoryElementDefiRSetSBTExpiration
  | HistoryElementDefiRRegulateAsset
  | HistoryElementDefiRBindRegulatedAssetToSbt
>;

export type HistoryElementBase = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: HistoryElementExecution;
  timestamp: number;
  dataFrom?: string;
  dataTo?: string;
};

type Arg = string | number;

export type CallArgs = Omit<Record<string, Arg | Arg[]>, 'args'>;

export type HistoryElementBatchCall = {
  data: CallArgs | { args: CallArgs };
  hash: string;
  module: string;
  method: string;
};

export type HistoryElement = HistoryElementBase & {
  data: HistoryElementDataBase;
  calls: HistoryElementBatchCall[];
};

export type UpdatesStream = {
  id: string;
  block: number;
  data: string; // stringified JSON
};

export type AssetEntity = SubqueryAssetEntity | SubsquidAssetEntity;

export type AssetSnapshotEntity = AssetSnapshotBaseEntity & {
  asset: AssetBaseEntity;
};

export type PoolXYKEntity = SubqueryPoolXYKEntity | SubsquidPoolXYKEntity;

export type OrderBookEntity = SubqueryOrderBookEntity | SubsquidOrderBookEntity;

export type OrderBookSnapshotEntity = SubqueryOrderBookSnapshotEntity | SubsquidOrderBookSnapshotEntity;

export type OrderBookOrderEntity = SubqueryOrderBookOrderEntity | SubsquidOrderBookOrderEntity;

export type AccountEntity = SubqueryAccountEntity | SubsquidAccountEntity;
