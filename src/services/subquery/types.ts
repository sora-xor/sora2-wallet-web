import type { History, CodecString, FPNumber } from '@sora-substrate/util';

import type { SoraNetwork } from '../../consts';

export interface ExplorerDataParser {
  parseTransactionAsHistoryItem: (transaction: any) => Promise<Nullable<History>>;
}

export interface Explorer {
  soraNetwork: SoraNetwork;
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
}

export type PoolXYKEntity = {
  strategicBonusApy: Nullable<string>;
  priceUSD: Nullable<string>;
  targetAssetId: string;
};

export type FiatPriceAndApyObject = {
  [key: string]: {
    price?: CodecString;
    strategicBonusApy?: CodecString;
  };
};

/**
 * `key` is timestamp, `value` is price USD
 */
export type HistoricalPrice = {
  [key: number]: CodecString;
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
    rewards?: ClaimedRewardItem[];
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
  >;
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

export type ReferralSetReferrer = {
  from: string; // referral
  to: string; // referrer
};

export type ReferrerReserve = {
  from: string;
  to: string;
  amount: string;
};

export type ReferralRewardsGroup = {
  keys: [string];
  sum: {
    amount: CodecString;
  };
};
