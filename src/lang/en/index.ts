import { Operation, TransactionStatus } from '@sora-substrate/util';
import { BalanceType } from '@sora-substrate/util/build/assets/consts';

import { AddAssetTabs, TokenTabs, WalletTabs } from '../../consts';

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addAssetText: 'Add asset',
  createTokenText: 'Create',
  createTokenTextNFT: 'Create NFT',
  comingSoonText: 'Coming soon',
  successText: 'Success',
  warningText: 'Warning',
  swapText: 'Swap',
  searchText: 'Search',
  cancelText: 'Cancel',
  saveText: 'Save',
  copiedText: 'Copied!',
  copyWithValue: 'Copy {value}',
  copiedWithValue: '{value} is copied!',
  sendText: 'Send',
  sentText: 'Sent',
  receivedText: 'Received',
  addressText: 'Address',
  amountText: 'Amount',
  confirmText: 'Confirm',
  errorText: 'Error',
  insufficientBalanceText: 'Insufficient {tokenSymbol} balance',
  unknownErrorText: 'ERROR Something went wrong...',
  transactionSubmittedText: 'Transaction was submitted',
  assetDeposit: 'Asset balance has been deposited',
  operations: {
    [Operation.Swap]: 'Swap',
    [Operation.SwapAndSend]: 'Swap and Send',
    [Operation.Transfer]: 'Transfer',
    [Operation.AddLiquidity]: 'Add Liquidity',
    [Operation.RemoveLiquidity]: 'Remove Liquidity',
    [Operation.CreatePair]: 'Create Pair',
    [Operation.RegisterAsset]: 'Register Asset',
    [Operation.ClaimRewards]: 'Claim Rewards',
    [Operation.ReferralReserveXor]: 'Bond XOR',
    [Operation.ReferralUnreserveXor]: 'Unbond XOR',
    [Operation.ReferralSetInvitedUser]: 'Set Referral',
    [Operation.DemeterFarmingDepositLiquidity]: 'Deposit Liquidity',
    [Operation.DemeterFarmingWithdrawLiquidity]: 'Withdraw Liquidity',
    [Operation.DemeterFarmingStakeToken]: 'Add Stake',
    [Operation.DemeterFarmingUnstakeToken]: 'Remove Stake',
    [Operation.DemeterFarmingGetRewards]: 'Claim Rewards',
    andText: 'and',
    [TransactionStatus.Finalized]: {
      [Operation.Transfer]: '{action} {amount} {symbol} {direction} {address}',
      [Operation.Swap]: 'Swapped {amount} {symbol} for {amount2} {symbol2}',
      [Operation.SwapAndSend]: 'Swapped {amount} {symbol} for {amount2} {symbol2} and sent to {address}',
      [Operation.AddLiquidity]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Removed {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Registered {symbol} asset',
      [Operation.ClaimRewards]: 'Reward claimed successfully {rewards}',
      [Operation.ReferralReserveXor]: 'Bonded XOR successfully',
      [Operation.ReferralUnreserveXor]: 'Unbonded XOR successfully',
      [Operation.ReferralSetInvitedUser]: 'Set Referral',
      [Operation.DemeterFarmingDepositLiquidity]: 'Supplied {symbol} and {symbol2} {amount} LP tokens for farming',
      [Operation.DemeterFarmingWithdrawLiquidity]: 'Removed {symbol} and {symbol2} {amount} LP tokens from farming',
      [Operation.DemeterFarmingStakeToken]: 'Added {amount} {symbol} for staking',
      [Operation.DemeterFarmingUnstakeToken]: 'Removed {amount} {symbol} from staking',
      [Operation.DemeterFarmingGetRewards]: '{amount} {symbol} claimed successfully',
    },
    [TransactionStatus.Error]: {
      [Operation.Transfer]: 'Failed to send {amount} {symbol} to {address}',
      [Operation.Swap]: 'Failed to swap {amount} {symbol} for {amount2} {symbol2}',
      [Operation.SwapAndSend]: 'Failed to swap {amount} {symbol} for {amount2} {symbol2} and send to {address}',
      [Operation.AddLiquidity]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Failed to remove {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Failed to register {symbol} asset',
      [Operation.ClaimRewards]: 'Failed to claim rewards {rewards}',
      [Operation.ReferralReserveXor]: 'Failed to bond XOR',
      [Operation.ReferralUnreserveXor]: 'Failed to unbonded XOR',
      [Operation.ReferralSetInvitedUser]: 'Failed to set referral',
      [Operation.DemeterFarmingDepositLiquidity]:
        'Failed to supply {amount} {symbol} and {symbol2} LP tokens for farming',
      [Operation.DemeterFarmingWithdrawLiquidity]:
        'Failed to remove {amount} {symbol} and {symbol2} LP tokens from farming',
      [Operation.DemeterFarmingStakeToken]: 'Failed to add {amount} {symbol} for staking',
      [Operation.DemeterFarmingUnstakeToken]: 'Failed to remove {amount} {symbol} from staking',
      [Operation.DemeterFarmingGetRewards]: 'Failed to claim {symbol}',
    },
  },
  polkadotjs: {
    noExtensions:
      'No {polkadotJs} extension was found. Please install it and reload this page\nhttps://polkadot.js.org/extension/',
    noExtension: 'No {extension} extension was found. Please install it and reload this page',
    noAccounts: 'There seems to be no accounts in your {polkadotJs} extension. Please add an account and try again.',
    noAccount: '{extension} account error. Please check your account in the {extension} extension',
    noSigner: 'Access denied. Go to {extension} extension settings and open "Manage Website Access" to allow.',
  },
  connection: {
    title: '{sora} Network account',
    text: 'Connect your {sora} Network accounts or create new ones with {polkadotJs} browser extension. This extension allows you to securely sign transactions and manage assets in {sora} Network.',
    noAccounts: 'No account found in your {polkadotJs} browser extension. Please add an account and try again.',
    selectAccount: 'Select account to work with',
    selectWallet: 'Select a wallet to work with',
    action: {
      install: 'Install extension',
      learnMore: 'Learn more',
      connect: 'Connect account',
      refresh: 'Refresh',
    },
    wallet: {
      connected: 'Connected',
      notConnected: 'Not connected',
      install: 'Install',
    },
  },
  wallet: {
    title: '{sora} Network account',
    [WalletTabs.Assets]: 'Assets',
    [WalletTabs.Activity]: 'Activity',
    addAsset: '@:addAssetText',
    createToken: '@:createTokenText',
  },
  walletSend: {
    title: 'Send',
    tooltip: 'Send tokens between {sora} network accounts',
    address: '@:addressText',
    addressWarning:
      'Tokens will be sent to the {sora} address below. Make sure the recipient can access the {sora} chain to use the tokens:',
    addressError: 'You cannot send tokens to the same acount that you are currently connected to.',
    amount: '@:amountText',
    balance: 'Balance',
    max: 'MAX',
    fee: 'Network fee',
    feeTooltip: '@:networkFeeTooltipText',
    enterAddress: 'Enter address',
    badAddress: 'Incorrect address',
    enterAmount: 'Enter amount',
    badAmount: '@:insufficientBalanceText',
    confirmTitle: 'Confirm transaction',
    confirm: '@:confirmText',
    errorAddress: 'Invalid address. Please check it and try again.',
  },
  account: {
    walletAddress: 'Wallet address',
    copy: 'Copy address',
    switch: 'Switch account',
  },
  history: {
    clearHistory: 'Clear history',
    filterPlaceholder: 'Filter by Address, Symbol, Type or Block ID',
    empty: 'Your transactions will appear here',
    emptySearch: 'No transactions found',
  },
  assets: {
    empty: 'There are no assets',
    totalAssetsValue: 'Your total assets value:',
    add: '@:addAssetText',
    swap: '@:swapText',
    send: '@:sendText',
    details: 'Details',
    receive: '@:account.copy',
    liquidity: 'Add liquidity',
    bridge: 'Bridge',
    assetId: 'Asset ID',
    copy: 'Copy Asset ID',
    copied: 'Copied!',
    balance: {
      [BalanceType.Transferable]: 'Transferable',
      [BalanceType.Frozen]: 'Frozen',
      [BalanceType.Locked]: ' - Locked',
      [BalanceType.Reserved]: ' - Reserved',
      [BalanceType.Total]: 'Total',
      [BalanceType.Bonded]: 'Bonded',
    },
  },
  asset: {
    remove: 'Remove asset',
    select: 'Select an asset',
    receive: 'Receive {symbol}',
  },
  code: {
    download: 'Download QR Code',
    upload: 'Scan QR',
    receive: 'Receive',
    invalid: 'Invalid QR Code',
    import: 'Import an image',
    scan: 'Scan with camera',
    allowanceError: 'Check your camera availability and browser permissions to use it',
  },
  addAsset: {
    title: '@:addAssetText',
    action: '@:addAssetText',
    success: 'Asset {symbol} was added successfully!',
    [AddAssetTabs.Token]: {
      title: 'Tokens',
      switchBtn: 'Verified assets only',
    },
    [AddAssetTabs.NFT]: {
      title: 'NFTs',
    },
    searchInputText: 'Search by Asset ID, Name or Ticker Symbol',
    empty: 'No tokens found',
    alreadyAttached: 'Token was already attached',
    understand: 'I understand',
    warningTitle: 'Trade at your own risk!',
    warningMessage:
      'Anyone can create a token, including creating fake versions of existing tokens that claim to represent projects.\nIf you purchase this token, you may not be able to sell it back.',
    approved: 'Asset approved by community',
    unknown: 'Unknown source',
    scam: 'SCAM',
    next: 'Next',
  },
  createToken: {
    title: '@:createTokenText',
    titleCommon: 'Create',
    confirmTokenTitleCommon: 'Create Token',
    confirmTokenTitleNFT: 'Create NFT',
    action: '@:createTokenText',
    actionNFT: '@:createTokenTextNFT',
    enterSymbol: 'Enter token symbol',
    enterName: 'Enter token name',
    enterSupply: 'Enter token supply',
    provideContent: 'Provide content',
    selectLocalFile: 'Select local file',
    enterTokenDescription: 'Enter description',
    [TokenTabs.Token]: 'Token',
    [TokenTabs.NonFungibleToken]: 'NFT',
    nft: {
      source: {
        label: 'Source',
        value: 'Local files',
        limit: 'Choose another file',
      },
      link: {
        placeholder: 'IPFS link',
        copyLink: 'Copy link',
        tooltip:
          "IPFS is a distributed system for storing and accessing files, making it possible to access files from many locations that aren't managed by one organization.",
      },
      image: {
        placeholderNoImage: 'Upload the file by either entering a link or choosing from local storage',
        placeholderBadSource: 'The file failed to be processed',
        placeholderBadSourceAddition: 'or it’s not uploaded to IPFS yet',
        placeholderFileLimit: 'The file size exceeds the limit of {value}mb',
      },
      supply: {
        placeholder: 'Token supply',
        desc: 'Amount of NFTs you’re going to get.',
        quantity: 'Quantity',
      },
      description: {
        placeholder: 'Description',
      },
    },
    confirm: '@:confirmText',
    success: {
      title: 'Transaction submitted',
      desc: 'Create {symbol} token',
    },
    fee: 'Network fee',
    insufficientBalance: '@:insufficientBalanceText',
    feeError: 'Failed to get a fee for a transaction',
    error: 'Failed to create {symbol} token',
    tokenSymbol: {
      placeholder: 'Token symbol',
      desc: 'This is an identifier for the token. You can use from 1 to 7 characters for the selection.',
    },
    tokenName: {
      placeholder: 'Token name',
      desc: 'This is a name for the token. You can use from 1 to 33 characters for the selection.',
    },
    tokenSupply: {
      placeholder: 'Token supply',
      desc: 'You will receive these tokens upon creation.',
    },
    extensibleSupply: {
      placeholder: 'Extensible supply',
      desc: 'Ability to mint more tokens.',
    },
    divisible: {
      placeholder: 'Divisible',
      desc: 'Ability of NFT to divide into fractional parts. Liquidity provisioning only works with divisible assets',
    },
  },
  transaction: {
    title: 'Transaction details',
    blockId: 'Block Id',
    txId: 'Transaction Id',
    status: 'Status',
    statuses: {
      pending: 'Pending...',
      failed: 'Transaction failed',
      complete: 'Complete',
    },
    errorMessage: 'Error',
    startTime: 'Date',
    amount: '@:amountText',
    amount2: '@:amountText 2',
    fee: 'Transaction Fee',
    total: 'Total',
    from: 'From',
    to: 'To',
    referrer: 'Referrer',
    referral: 'Referral',
    viewIn: {
      sorascan: 'View in SORAScan',
      subscan: 'View in Subscan',
    },
    copy: 'Copy {value}',
    history: {
      created: 'Transaction for {amount} {symbol} has been created.',
      submitted: 'Transaction submitted with fee of {fee} {symbol}',
      confirmed: 'Transaction confirmed',
    },
  },
  confirmNextTxFailure: {
    header: 'Attention',
    info: 'Your XOR balance will be less than {fee} XOR after this transaction. You won’t be able to pay for the network fee for another transaction.',
    payoff:
      'You would have to use the Bridge to get XOR from other networks, get sent XOR from another {sora} account, or swap any other token already in your account into XOR.',
    button: 'Yes, I understand the risk',
  },
  historyErrorMessages: {
    generalError: 'Something went wrong',
    balances: {
      LiquidityRestrictions: 'Account liquidity restrictions prevent withdrawal',
    },
    poolXyk: {
      SourceBalanceIsNotLargeEnough: 'Source balance is not large enough',
      TargetBalanceIsNotLargeEnough: 'Destination balance is not large enough',
      ZeroValueInAmountParameter: 'Amount parameter has zero value',
      ImpossibleToDecideValidPairValuesFromRangeForThisPool: 'Provided amounts are too diverse',
      CalculatedValueIsNotMeetsRequiredBoundaries: 'Amounts are out of required bounds',
      UnableToDepositXorLessThanMinimum: 'XOR lower than the minimum value (0.007)',
    },
    xstPool: {
      PoolAlreadyInitializedForPair: 'Pool pair already exists',
      SlippageLimitExceeded: 'Slippage tolerance has not met proper limits',
    },
    referrals: {
      AlreadyHasReferrer: 'Account already has a referrer',
      ReferrerInsufficientBalance: 'Referrer does not have enough of reserved balance',
    },
    vestedRewards: {
      RewardsSupplyShortage: 'Rewards program has already finished',
      CantCalculateReward: 'Failed to perform reward calculation',
      NoRewardsForAsset: 'There are no rewards for this asset',
    },
    liquidityProxy: {
      ForbiddenFilter: 'Selected liquidity source is not allowed',
    },
    demeterFarmingPlatform: {
      InsufficientFunds: 'Insufficient funds',
      ZeroRewards: 'No rewards',
      InsufficientLPTokens: 'Insufficient liquidity provision tokens',
      PoolDoesNotHaveRewards: 'Pool does not have rewards',
    },
    multicollateralBondingCurvePool: {
      PriceCalculationFailed: 'An error occurred while calculating the price',
    },
  },
};
