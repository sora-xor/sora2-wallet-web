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
  OrderBook = 'orderBook',
  Staking = 'staking',
  Vault = 'kensetsu',
  Sbt = 'defiR',
}

export enum ModuleMethods {
  AssetsRegister = 'register',
  AssetsTransfer = 'transfer',
  AssetsBurn = 'burn',
  AssetsMint = 'mint',
  PoolXYKInitializePool = 'initializePool',
  PoolXYKDepositLiquidity = 'depositLiquidity',
  PoolXYKWithdrawLiquidity = 'withdrawLiquidity',
  LiquidityProxySwap = 'swap',
  LiquidityProxySwapTransfer = 'swapTransfer',
  LiquidityProxySwapTransferBatch = 'swapTransferBatch',
  LiquidityProxyXorlessTransfer = 'xorlessTransfer',
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
  OrderBookPlaceLimitOrder = 'placeLimitOrder',
  OrderBookCancelLimitOrder = 'cancelLimitOrder',
  OrderBookCancelLimitOrders = 'cancelLimitOrdersBatch',
  StakingBond = 'bond',
  StakingBondExtra = 'bondExtra',
  StakingRebond = 'rebond',
  StakingUnbond = 'unbond',
  StakingWithdrawUnbonded = 'withdrawUnbonded',
  StakingNominate = 'nominate',
  StakingChill = 'chill',
  StakingSetPayee = 'setPayee',
  StakingSetController = 'setController',
  StakingPayout = 'payoutStakers',
  VaultCreate = 'createCdp',
  VaultClose = 'closeCdp',
  VaultCollateralDeposit = 'depositCollateral',
  VaultDebtPayment = 'repayDebt',
  VaultDebtBorrow = 'borrow',
  SbtSetAccessExpiration = 'expiration',
  SbtRegulateAsset = 'regulate',
  SbtRegisterAndRegulateAsset = 'regulateAndRegister',
  SbtBindRegulatedAsset = 'bind',
  SbtIssueSoulBoundToken = 'issueSBT',
}
