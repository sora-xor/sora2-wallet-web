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
  sendText: 'Send',
  sentText: 'Sent',
  recievedText: 'Recieved',
  addressText: 'Address',
  amountText: 'Amount',
  confirmText: 'Confirm',
  errorText: 'Error',
  insufficientBalanceText: 'Insufficient {tokenSymbol} balance',
  unknownErrorText: 'ERROR Something went wrong...',
  enterAccountError: 'Unable to enter account',
  transactionSubmittedText: 'Transaction was submitted',
  operations: {
    [Operation.Swap]: 'Swap',
    [Operation.SwapAndSend]: 'Swap and Send',
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
      [Operation.SwapAndSend]: 'Swapped {amount} {symbol} for {amount2} {symbol2} and sent to {address}',
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
      [Operation.SwapAndSend]: 'Failed to swap {amount} {symbol} for {amount2} {symbol2} and send to {address}',
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
    select: 'Select an asset',
    recieve: 'Recieve {symbol}',
  },
  code: {
    download: 'Download QR Code',
    upload: 'Scan QR',
    recieve: 'Recieve',
    invalid: 'Invalid QR Code',
  },
  addAsset: {
    title: '@:addAssetText',
    action: '@:addAssetText',
    success: 'Asset {symbol} was added successfully!',
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
  desktop: {
    welcome: {
      header: 'Welcome to Polkaswap!',
      headline: 'Let’s set up your account',
      text: 'Create your SORA Network account or log into the old ones using mnemonic phrase or .json import. This allows you to securely sign transactions and manage assets in SORA Network.',
      createAccount: 'Create an account',
      importAccount: 'Import Account',
    },
    heading: {
      seedPhraseTitle: 'Seed phrase',
      confirmSeedTitle: 'Confirm seed phrase',
      accountDetailsTitle: 'Account Details',
      importTitle: 'Import account',
    },
    button: {
      next: 'Next step',
      skip: 'Skip',
      createAccount: 'Create Account',
      importAccount: 'Import account',
    },
    accountName: {
      placeholder: 'Wallet name',
      desc: 'This is the public name of your wallet which will be visible to everyone',
    },
    password: {
      placeholder: 'Password',
      desc: 'Ensure you are using a strong password for proper protection',
    },
    confirmPassword: {
      placeholder: 'Confirm password',
    },
    accountMnemonic: {
      placeholder: 'Mnemonic phrase',
    },
    seedAdviceText:
      'This is a secret seed of your account. Make sure to store it on a non-digital carrier, for example - paper',
    confirmSeedText: 'Confirm the seed phrase by clicking words in the correct order',
    errorMnemonicText: 'Incorrect seed phrase order',
    exportOptionText: 'Export .json account file',
    exportJsonText:
      'You will always be able to access your account by importing that .json file. Do not share it with anyone!',
    addAccount: 'Add an account',
    dialog: {
      confirmTitle: 'Confirm with password',
      confirmButton: 'Sign Transaction',
      savePasswordText: 'Remember my password for next 15 minutes',
      extendPasswordText: 'Extend period without password by 15 minutes',
    },
    errorMessages: {
      password: 'Password did not match',
      passwords: 'Passwords did not match',
      mnemonic: 'Invalid bip39 mnemonic specified',
      mnemonicLength: 'Mnemonic should contain {number} words',
      jsonFields: 'JSON file does not have required fields',
    },
  },
};
