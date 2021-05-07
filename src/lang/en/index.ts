import { Operation, TransactionStatus } from '@sora-substrate/util'

import { AddAssetTabs, WalletTabs } from '../../consts'
import { BalanceTypes } from '../../types'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addAssetText: 'Add asset',
  createTokenText: 'Create token',
  comingSoonText: 'Coming soon',
  successText: 'Success',
  warningText: 'Warning',
  swapText: 'Swap',
  searchText: 'Search',
  cancelText: 'Cancel',
  saveText: 'Save',
  logoutText: 'Log out',
  sendText: 'Send',
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
    andText: 'and',
    [TransactionStatus.Finalized]: {
      [Operation.Transfer]: 'Sent {amount} {symbol} to {address}',
      [Operation.Swap]: 'Swapped {amount} {symbol} for {amount2} {symbol2}',
      [Operation.AddLiquidity]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Removed {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Supplied {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Registered {symbol} asset',
      [Operation.ClaimRewards]: 'Reward claimed successfully {rewards}'
    },
    [TransactionStatus.Error]: {
      [Operation.Transfer]: 'Failed to send {amount} {symbol} to {address}',
      [Operation.Swap]: 'Failed to swap {amount} {symbol} for {amount2} {symbol2}',
      [Operation.AddLiquidity]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RemoveLiquidity]: 'Failed to remove {amount} {symbol} and {amount2} {symbol2}',
      [Operation.CreatePair]: 'Failed to supply {amount} {symbol} and {amount2} {symbol2}',
      [Operation.RegisterAsset]: 'Failed to register {symbol} asset',
      [Operation.ClaimRewards]: 'Failed to claim rewards {rewards}'
    }
  },
  polkadotjs: {
    noExtensions: 'No Polkadot.js extension was found. Please install it and reload this page\nhttps://polkadot.js.org/extension/',
    noAccounts: 'There seems to be no accounts in your Polkadot.js extension. Please add an account and try again.',
    noAccount: 'Polkadot.js account error. Please check your account in the Polkadot.js extension'
  },
  connection: {
    title: 'SORA Network account',
    text: 'Connect your SORA Network accounts or create new ones with polkadot{.js} browser extension. This extension allows you to securely sign transactions and manage assets in SORA Network.',
    install: 'No polkadot.js extension found. Install it and reload the page.<br/><span class="wallet-connection-link">https://polkadot.js.org/extension/</span>',
    noPermissions: 'Accidentally rejected permission request?</br>Currently polkadot{.js} extension doesn’t have permission managment. As a workaround you can restart your browser and revisit this page to proceed with authorization.',
    noAccounts: 'No account found in your polkadot{.js} browser extension. Please add an account and try again.',
    selectAccount: 'Select account to work with',
    loadingTitle: 'Waiting for you to allow access to polkadot{.js} extension..',
    action: {
      install: 'Install extension',
      learnMore: 'Learn more',
      connect: 'Connect account',
      refresh: 'Refresh'
    }
  },
  wallet: {
    title: 'SORA Network account',
    [WalletTabs.Assets]: 'Assets',
    [WalletTabs.Activity]: 'Activity',
    addAsset: '@:addAssetText',
    createToken: '@:createTokenText'
  },
  walletSend: {
    title: 'Send',
    address: '@:addressText',
    amount: '@:amountText',
    balance: 'Balance',
    max: 'MAX',
    fee: 'Transaction Fee',
    enterAddress: 'Enter address',
    badAddress: 'Incorrect address',
    enterAmount: 'Enter amount',
    badAmount: '@:insufficientBalanceText',
    confirmTitle: 'Confirm transaction',
    confirm: '@:confirmText',
    errorAddress: 'Invalid address. Please check it and try again.'
  },
  account: {
    successCopy: 'Wallet address is copied to the clipboard',
    copy: 'Copy address',
    switch: 'Switch account',
    logout: 'Logout'
  },
  history: {
    clearHistory: 'Clear history',
    filterPlaceholder: 'Filter by Address, Symbol, Type or Block ID',
    empty: 'Your transactions will appear here',
    emptySearch: 'No transactions found'
  },
  assets: {
    empty: 'There are no assets',
    add: '@:addAssetText',
    swap: '@:swapText',
    send: '@:sendText',
    receive: '@:account.copy',
    liquidity: 'Add liquidity',
    bridge: 'Bridge',
    copy: 'Copy Asset ID',
    successCopy: '{symbol} Asset ID is copied to the clipboard',
    copied: 'Copied!',
    balance: {
      [BalanceTypes.Transferable]: 'Transferable',
      [BalanceTypes.Frozen]: 'Frozen',
      [BalanceTypes.Locked]: ' - Locked',
      [BalanceTypes.Reserved]: ' - Reserved',
      [BalanceTypes.Total]: 'Total'
    }
  },
  asset: {
    remove: 'Remove asset'
  },
  addAsset: {
    title: '@:addAssetText',
    action: '@:addAssetText',
    success: 'Asset was added successfully!',
    [AddAssetTabs.Search]: {
      title: '@:searchText',
      placeholder: 'Filter by Asset ID, Name or Ticker Symbol'
    },
    [AddAssetTabs.Custom]: {
      title: 'Custom asset',
      addressPlaceholder: '@:addressText',
      symbolPlaceholder: 'Asset symbol'
    },
    empty: 'No tokens found',
    alreadyAttached: 'Token was already attached'
  },
  createToken: {
    title: '@:createTokenText',
    desc: 'Create and deploy custom asset on SORA',
    action: '@:createTokenText',
    enterSymbol: 'Enter token symbol',
    enterName: 'Enter token name',
    enterSupply: 'Enter token supply',
    confirm: '@:confirmText',
    success: {
      title: 'Transaction submitted',
      desc: 'Create {symbol} token'
    },
    tooltipValue: 'To create a token, you have to pay a fee',
    fee: 'Network fee',
    insufficientBalance: '@:insufficientBalanceText',
    feeError: 'Failed to get a fee for a transaction',
    error: 'Failed to create {symbol} token',
    tokenSymbol: {
      placeholder: 'Token symbol',
      desc: 'This is an identifier for the token. You can use from 1 to 7 characters for the selection.'
    },
    tokenName: {
      placeholder: 'Token name',
      desc: 'This is a name for the token. You can use from 1 to 33 characters for the selection.'
    },
    tokenSupply: {
      placeholder: 'Token supply',
      desc: 'You will receive these tokens upon creation.'
    },
    extensibleSupply: {
      placeholder: 'Extensible supply'
    }
  },
  transaction: {
    title: 'Transaction details',
    hash: 'Transaction Hash',
    status: 'Status',
    statuses: {
      pending: 'Pending...',
      failed: 'Transaction failed',
      complete: 'Complete'
    },
    errorMessage: 'Error',
    startTime: 'Date',
    amount: '@:amountText',
    amount2: '@:amountText 2',
    fee: 'Transaction Fee',
    total: 'Total',
    from: 'From',
    to: 'To',
    viewInPolkascan: 'View in Polkascan',
    successCopy: '{value} is copied to the clipboard',
    copy: 'Copy {value}',
    history: {
      created: 'Transaction for {amount} {symbol} has been created.',
      submitted: 'Transaction submitted with fee of {fee} {symbol}',
      confirmed: 'Transaction confirmed'
    }
  }
}
