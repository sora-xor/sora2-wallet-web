import { Operation, TransactionStatus, BalanceType } from '@sora-substrate/util';

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
  sendText: 'Send',
  sentText: 'Sent',
  recievedText: 'Recieved',
  addressText: 'Address',
  amountText: 'Amount',
  confirmText: 'Confirm',
  errorText: 'Error',
  insufficientBalanceText: 'Insufficient {tokenSymbol} balance',
  unknownErrorText: 'ERROR Something went wrong...',
  transactionSubmittedText: 'Transaction was submitted',
  operations: {
    [Operation.Swap]: 'Swap',
    [Operation.Transfer]: 'Transfer',
    [Operation.AddLiquidity]: 'Add Liquidity',
    [Operation.RemoveLiquidity]: 'Remove Liquidity',
    [Operation.CreatePair]: 'Create Pair',
    [Operation.RegisterAsset]: 'Register Asset',
    [Operation.ClaimRewards]: 'Claim Rewards',
    [Operation.ClaimRewards]: 'Claim Rewards',
    [Operation.ReferralReserveXor]: 'Bond XOR',
    [Operation.ReferralUnreserveXor]: 'Unbond XOR',
    [Operation.ReferralSetInvitedUser]: 'Set Referral',
    andText: 'and',
    [TransactionStatus.Finalized]: {
      [Operation.Transfer]: '{action} {amount} {symbol} {direction} {address}',
      [Operation.Swap]: 'Swapped {amount} {symbol} for {amount2} {symbol2}',
      [Operation.AddLiquidity]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Removed {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Registered {symbol} asset',
      [Operation.ClaimRewards]: 'Reward claimed successfully {rewards}',
      [Operation.ReferralReserveXor]: 'Bonded XOR successfully',
      [Operation.ReferralUnreserveXor]: 'Unbonded XOR successfully',
      [Operation.ReferralSetInvitedUser]: 'Set Referral',
    },
    [TransactionStatus.Error]: {
      [Operation.Transfer]: 'Failed to send {amount} {symbol} to {address}',
      [Operation.Swap]: 'Failed to swap {amount} {symbol} for {amount2} {symbol2}',
      [Operation.AddLiquidity]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Failed to remove {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Failed to register {symbol} asset',
      [Operation.ClaimRewards]: 'Failed to claim rewards {rewards}',
      [Operation.ReferralReserveXor]: 'Failed to bond XOR',
      [Operation.ReferralUnreserveXor]: 'Failed to unbonded XOR',
      [Operation.ReferralSetInvitedUser]: 'Failed to set referral',
    },
  },
  polkadotjs: {
    noExtensions:
      'No Polkadot.js extension was found. Please install it and reload this page\nhttps://polkadot.js.org/extension/',
    noAccounts: 'There seems to be no accounts in your Polkadot.js extension. Please add an account and try again.',
    noAccount: 'Polkadot.js account error. Please check your account in the Polkadot.js extension',
  },
  connection: {
    title: 'SORA Network account',
    text: 'Connect your SORA Network accounts or create new ones with polkadot{.js} browser extension. This extension allows you to securely sign transactions and manage assets in SORA Network.',
    install:
      'No polkadot.js extension found. Install it and <a href="#" onclick="window.location.reload(true);" class="wallet-connection-link">reload</a> the page.<br/><span class="wallet-connection-link">https://polkadot.js.org/extension/</span>',
    noPermissions:
      'Accidentally denied access for polkadot{.js}?</br>Go to polkadot{.js} settings and open "Manage Website Access" to allow.',
    noAccounts: 'No account found in your polkadot{.js} browser extension. Please add an account and try again.',
    selectAccount: 'Select account to work with',
    loadingTitle: 'Waiting for you to allow access to polkadot{.js} extension..',
    action: {
      install: 'Install extension',
      learnMore: 'Learn more',
      connect: 'Connect account',
      refresh: 'Refresh',
    },
  },
  wallet: {
    title: 'SORA Network account',
    [WalletTabs.Assets]: 'Assets',
    [WalletTabs.Activity]: 'Activity',
    addAsset: '@:addAssetText',
    createToken: '@:createTokenText',
  },
  walletSend: {
    title: 'Send',
    tooltip: 'Send tokens between SORA network accounts',
    address: '@:addressText',
    addressWarning:
      'Tokens will be sent to the SORA address below. Make sure the recipient can access the SORA chain to use the tokens:',
    addressError: 'You cannot send tokens to the same acount that you are currently connected to.',
    amount: '@:amountText',
    balance: 'Balance',
    max: 'MAX',
    fee: 'Network fee',
    feeTooltip: "Network fee is used to ensure SORA system's growth and stable performance.",
    enterAddress: 'Enter address',
    badAddress: 'Incorrect address',
    enterAmount: 'Enter amount',
    badAmount: '@:insufficientBalanceText',
    confirmTitle: 'Confirm transaction',
    confirm: '@:confirmText',
    errorAddress: 'Invalid address. Please check it and try again.',
  },
  account: {
    successCopy: 'Wallet address is copied to the clipboard',
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
    copy: 'Copy Asset ID',
    successCopy: '{symbol} Asset ID is copied to the clipboard',
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
  },
  addAsset: {
    title: '@:addAssetText',
    action: '@:addAssetText',
    success: 'Asset was added successfully!',
    [AddAssetTabs.Search]: {
      title: '@:searchText',
      placeholder: 'Filter by Asset ID, Name or Ticker Symbol',
    },
    [AddAssetTabs.Custom]: {
      title: 'Custom asset',
      addressPlaceholder: '@:addressText',
      symbolPlaceholder: 'Asset symbol',
    },
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
    desc: 'Create and deploy custom asset on SORA',
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
      },
      link: {
        placeholder: 'Enter link here...',
        placeholderShort: 'Link',
      },
      image: {
        placeholderNoImage: 'Upload the file by either entering a link or choosing from local storage',
        placeholderBadSource: 'There’s no image',
        placeholderBadSourceAddition: 'or it’s not uploaded to IPFS yet',
      },
      name: {
        placeholder: 'Name',
        desc: 'Name for the token. You can use from 1 to 33 characters for the selection.',
      },
      symbol: {
        placeholder: 'Symbol',
        desc: 'Identifier for the token. You can use from 3 to 5 alphanumeric characters for the selection.',
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
    tooltipValue: 'To create a token, you have to pay a fee',
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
    viewIn: {
      sorascan: 'View in SORAScan',
      subscan: 'View in Subscan',
    },
    successCopy: '{value} is copied to the clipboard',
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
      'You would have to use the Bridge to get XOR from other networks, get sent XOR from another SORA account, or swap any other token already in your account into XOR.',
    button: 'Yes, I understand the risk',
  },
};
