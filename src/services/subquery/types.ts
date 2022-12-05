import type { History, CodecString, FPNumber } from '@sora-substrate/util';

import type { SoraNetwork } from '../../consts';

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: Nullable<SoraNetwork>;
  getAccountTransactions: (variables?: any) => Promise<any>;
}

export enum ModuleNames {
  Assets = 'assets',
  LiquidityProxy = 'liquidityProxy',
  PoolXYK = 'poolXYK',
  TradingPair = 'tradingPair',
  Utility = 'utility',
  Referrals = 'referrals',
  EthBridge = 'ethBridge',
  BridgeMultisig = 'bridgeMultisig',
  Rewards = 'rewards',
  VestedRewards = 'vestedRewards',
  PswapDistribution = 'pswapDistribution',
  DemeterFarming = 'demeterFarmingPlatform',
}

export enum ModuleMethods {
  AssetsRegister = 'register',
  AssetsTransfer = 'transfer',
  PoolXYKInitializePool = 'initializePool',
  PoolXYKDepositLiquidity = 'depositLiquidity',
  PoolXYKWithdrawLiquidity = 'withdrawLiquidity',
  LiquidityProxySwap = 'swap',
  LiquidityProxySwapTransfer = 'swapTransfer',
  UtilityBatchAll = 'batchAll',
  ReferralsSetReferrer = 'setReferrer',
  ReferralsReserve = 'reserve',
  ReferralsUnreserve = 'unreserve',
  EthBridgeTransferToSidechain = 'transferToSidechain',
  BridgeMultisigAsMulti = 'asMulti',
  RewardsClaim = 'claim',
  VestedRewardsClaimRewards = 'claimRewards',
  VestedRewardsClaimCrowdloanRewards = 'claimCrowdloanRewards',
  PswapDistributionClaimIncentive = 'claimIncentive',
  DemeterFarmingDeposit = 'deposit',
  DemeterFarmingWithdraw = 'withdraw',
  DemeterFarmingGetRewards = 'getRewards',
}

export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
};

export enum AssetSnapshotTypes {
  DEFAULT = 'DEFAULT',
  HOUR = 'HOUR',
  DAY = 'DAY',
}

export enum MutationTypes {
  DELETE = 'DELETE',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
}

/* eslint-disable camelcase */
export type SubscriptionPayload<EntityData> = {
  id: string;
  mutation_type: MutationTypes;
  _entity: EntityData;
};

export type AccountEntity = {
  id: string;
  latest_history_element_id: string;
};

export type PoolXYKEntity = {
  id: string;
  strategicBonusApy: Nullable<string>;
  strategic_bonus_apy?: Nullable<string>;
  priceUSD: Nullable<string>;
  price_u_s_d?: Nullable<string>;
};
/* eslint-enable camelcase */

export type AssetSnapshot = {
  priceUSD: {
    low: string;
    high: string;
    open: string;
    close: string;
  };
  volume: {
    amount: string;
    amountUSD: string;
  };
  timestamp: number;
};

export type FiatPriceAndApyObject = {
  [key: string]: {
    price?: CodecString;
    strategicBonusApy?: CodecString;
  };
};

export type HistoryElementError = {
  moduleErrorId: number;
  moduleErrorIndex: number;
};

export type HistoryElementExecution = {
  success: boolean;
  error?: HistoryElementError;
};

export interface HistoryElementSwap {
  baseAssetAmount: string;
  baseAssetId: string;
  liquidityProviderFee: string;
  selectedMarket: string;
  targetAssetAmount: string;
  targetAssetId: string;
}

export interface HistoryElementSwapTransfer extends HistoryElementSwap {
  to: string;
}

export type HistoryElementTransfer = {
  amount: string;
  assetId: string;
  from: string;
  to: string;
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

export type UtilityBatchCall = {
  data: {
    args: {
      [key: string]: string | number;
    };
    callIndex: string;
  };
  hash: string;
  callId: string;
  module: string;
  method: string;
};

export type ExtrinsicEvent = {
  method: string;
  section: string;
  data: any[];
};

export type HistoryElementUtilityBatchAll = UtilityBatchCall[];

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

export type ReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type ReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type HistoryElement = {
  id: string;
  blockHash: string;
  blockHeight: string;
  module: string;
  method: string;
  address: string;
  networkFee: string;
  execution: HistoryElementExecution;
  timestamp: number;
  data: Nullable<
    | HistoryElementSwap
    | HistoryElementSwapTransfer
    | HistoryElementTransfer
    | HistoryElementLiquidityOperation
    | HistoryElementAssetRegistration
    | HistoryElementUtilityBatchAll
    | ReferralSetReferrer
    | ReferrerReserve
    | HistoryElementEthBridgeOutgoing
    | HistoryElementEthBridgeIncoming
    | HistoryElementRewardsClaim
    | HistoryElementDemeterFarming
  >;
};

export type HistoryElementsQueryResponse = {
  edges: Array<{
    cursor?: string;
    node: HistoryElement;
  }>;
  pageInfo?: PageInfo;
  totalCount?: number;
};

export type ReferrerRewards = {
  rewards: FPNumber;
  invitedUserRewards: {
    [key: string]: {
      rewards: FPNumber;
    };
  };
};

export type ReferrerReward = {
  id: string;
  blockHeight: string;
  referrer: string;
  referral: string;
  timestamp: number;
  amount: string;
};

export type AccountReferralReward = {
  referral: string;
  amount: string;
};
