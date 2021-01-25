import { KnownSymbols, Operation, TransactionStatus } from '@sora-substrate/util'

import { AccountMenu, AddAssetTabs, PasswordCondition, SourceTypes, WalletTabs, SettingsMenu, Languages } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addAssetText: 'Add token',
  comingSoonText: 'Coming soon',
  successText: 'Success',
  warningText: 'Warning',
  menuText: 'Menu',
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
  unknownErrorText: 'ERROR Something went wrong...',
  transactionSubmittedText: 'Transaction was submitted',
  [TransactionStatus.Finalized]: {
    [Operation.Transfer]: 'Sent {amount} {symbol} to {address}'
  },
  [TransactionStatus.Error]: {
    [Operation.Transfer]: 'Failed to send {amount} {symbol} to {address}'
  },
  assetNames: {
    [KnownSymbols.XOR]: 'Sora',
    [KnownSymbols.VAL]: 'Sora Validator Token',
    [KnownSymbols.PSWAP]: 'Polkaswap'
  },
  polkadotjs: {
    noExtensions: 'No Polkadot.js extension was found. Please install it and reload this page\nhttps://polkadot.js.org/extension/',
    noAccounts: 'There seems to be no accounts in your Polkadot.js extension. Please add an account and try again.',
    noAccount: 'Polkadot.js account error. Please check your account in the Polkadot.js extension'
  },
  sourceType: {
    placeholder: 'Source type',
    [SourceTypes.MnemonicSeed]: 'Mnemonic seed',
    [SourceTypes.RawSeed]: 'Raw seed',
    [SourceTypes.PolkadotJs]: 'Polkadot.js'
  },
  connection: {
    title: 'Connect wallet',
    create: {
      title: 'Create a new wallet',
      hint: 'This will create a new wallet and a seed phrase',
      action: '@:createWalletText'
    },
    import: {
      title: 'I already have a seed phrase',
      hint: 'Import your existing wallet using seed phrase, raw seed, JSON backup file or connect your Polkadot.js wallet.',
      action: 'Import wallet'
    }
  },
  creation: {
    title: '@:createWalletText',
    name: {
      placeholder: '@:nameText',
      hint: 'The name of this account and how it will appear in your addresses. With an on-chain identity, it can be made available to others.'
    },
    sourceType: {
      placeholder: '@:sourceType.placeholder',
      [SourceTypes.MnemonicSeed]: `@:sourceType.${SourceTypes.MnemonicSeed}`,
      hint: 'Please write down your wallet\'s seed and keep it in a safe place. The seed can be used to restore your wallet.'
    },
    action: '@:nextText'
  },
  import: {
    title: 'Import a wallet',
    sourceType: {
      placeholder: '@:sourceType.placeholder',
      [SourceTypes.MnemonicSeed]: `@:sourceType.${SourceTypes.MnemonicSeed}`,
      [SourceTypes.RawSeed]: `@:sourceType.${SourceTypes.RawSeed}`,
      [SourceTypes.PolkadotJs]: `@:sourceType.${SourceTypes.PolkadotJs}`
    },
    [SourceTypes.MnemonicSeed]: {
      placeholder: 'Separate each word with a single space. Make sure there are no extra spaces before and after the phrase.',
      hint: 'Enter your secret twelve word phrase here to restore your account.',
      name: {
        placeholder: '@:nameText',
        hint: 'The name of this account and how it will appear in your addresses. With an on-chain identity, it can be made available to others.'
      },
      password: {
        placeholder: 'Password',
        hint: 'This password is used to encrypt your private key. You will need it to sigh transactions with this account.',
        [PasswordCondition.LowerCase]: 'At least 1 lowercase letter',
        [PasswordCondition.UpperCase]: 'At least 1 uppercase letter',
        [PasswordCondition.Length]: 'At least 8 characters',
        [PasswordCondition.Digit]: 'At least 1 digit',
        validMessage: 'Passwords don\'t match'
      },
      repeatedPassword: {
        placeholder: 'Repeat password'
      }
    },
    [SourceTypes.RawSeed]: {
      placeholder: 'Seed (hex or string)',
      hint: 'Enter your seed here to restore your account.'
    },
    [SourceTypes.PolkadotJs]: {
      selectAccount: 'Select account'
    },
    action: '@:importText'
  },
  wallet: {
    title: 'Wallet',
    [WalletTabs.Assets]: 'Assets',
    [WalletTabs.Activity]: 'Activity',
    addAsset: '@:addAssetText'
  },
  walletSend: {
    title: 'Send',
    address: '@:addressText',
    amount: '@:amountText',
    balance: 'Balance',
    max: 'MAX',
    fee: 'Transaction Fee',
    enterAddress: 'Enter address',
    badAddress: 'Incorrect Address',
    noAmount: 'No Amount',
    badAmount: 'Insufficient {symbol} Balance',
    confirmTitle: 'Confirm transaction',
    confirm: '@:confirmText',
    errorAddress: 'Invalid address. Please check it and try again.'
  },
  account: {
    successCopy: 'Wallet address is copied to the clipboard',
    menu: {
      tooltip: '@:menuText',
      [AccountMenu.View]: 'View in Polkascan',
      [AccountMenu.Edit]: 'Edit name',
      [AccountMenu.Logout]: 'Logout'
    }
  },
  history: {
    empty: 'There is no activity'
  },
  assets: {
    empty: 'There are no assets',
    add: 'Add token',
    swap: '@:swapText',
    send: '@:sendText'
  },
  settings: {
    title: '@:settingsText',
    menu: {
      [SettingsMenu.Language]: {
        title: 'Language',
        desc: 'Wallet language settings'
      },
      [SettingsMenu.Networks]: {
        title: 'Networks',
        desc: 'Add and edit custom RPC networks'
      },
      [SettingsMenu.About]: {
        title: 'About',
        desc: 'Version, support center, contact info'
      }
    },
    language: {
      [Languages.EN]: 'English'
    },
    network: 'Network',
    networks: {
      desc: '',
      create: 'Add custom',
      customNetwork: 'Custom network',
      form: {
        name: 'Name',
        address: '@:addressText',
        explorer: 'Explorer'
      }
    },
    about: {
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
      termsOfServiceLink: 'https://sora.org',
      privacyPolicyLink: 'https://soramitsu.co.jp'
    }
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
