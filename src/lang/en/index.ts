import { KnownSymbols, Operation, TransactionStatus } from '@sora-substrate/util'

import { AddAssetTabs, WalletTabs } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addAssetText: 'Add token',
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
  insufficientBalanceText: 'Insufficient {symbol} balance',
  unknownErrorText: 'ERROR Something went wrong...',
  transactionSubmittedText: 'Transaction was submitted',
  operations: {
    [TransactionStatus.Finalized]: {
      [Operation.Transfer]: 'Sent {amount} {symbol} to {address}',
      [Operation.RegisterAsset]: 'Registered {symbol} asset'
    },
    [TransactionStatus.Error]: {
      [Operation.Transfer]: 'Failed to send {amount} {symbol} to {address}',
      [Operation.RegisterAsset]: 'Failed to register {symbol} asset'
    }
  },
  assetNames: {
    [KnownSymbols.XOR]: 'SORA',
    [KnownSymbols.VAL]: 'SORA Validator Token',
    [KnownSymbols.PSWAP]: 'Polkaswap'
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
    noAccounts: 'No account found in your polkadot{.js} browser extension. Please add an account and try again.',
    selectAccount: 'Select account to work with',
    loadingTitle: 'Waiting for you to allow access to polkadot{.js} extension..',
    loadingText: 'Accidenatlly rejected permission request?</br>Currently polkadot{.js} extension doesn’t have permission managment. As a workaround you can restart your browser and revisit this page to proceed with authorization.',
    action: {
      install: 'Install extension',
      learnMore: 'Learn more',
      connect: 'Connect account',
      refresh: 'Refresh'
    }
  },
  wallet: {
    title: 'Wallet',
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
    empty: 'There is no activity'
  },
  assets: {
    empty: 'There are no assets',
    add: 'Add token',
    swap: '@:swapText',
    send: '@:sendText',
    copy: 'Copy Asset ID',
    successCopy: '{symbol} Asset ID is copied to the clipboard'
  },
  asset: {
    remove: 'Remove asset'
  },
  addAsset: {
    title: '@:addAssetText',
    cancel: '@:cancelText',
    action: '@:addAssetText',
    success: 'Asset was added successfully!',
    [AddAssetTabs.Search]: {
      title: '@:searchText',
      placeholder: 'Search Asset Name, Symbol, or Address',
      info: 'Add the tokens you\'ve acquired using MetaMask'
    },
    [AddAssetTabs.Custom]: {
      title: 'Custom token',
      addressPlaceholder: '@:addressText',
      symbolPlaceholder: 'Asset symbol'
    },
    empty: 'No tokens found',
    alreadyAttached: 'Token was already attached'
  },
  createToken: {
    title: '@:createTokenText',
    desc: 'Create and deploy custom token on SORA',
    action: '@:createTokenText',
    enterSymbol: 'Enter token symbol',
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
    date: 'Date',
    amount: '@:amountText',
    fee: 'Transaction Fee',
    total: 'Total',
    from: 'From',
    to: 'To',
    history: {
      created: 'Transaction for {amount} {symbol} has been created.',
      submitted: 'Transaction submitted with fee of {fee} {symbol}',
      confirmed: 'Transaction confirmed'
    }
  }
}
