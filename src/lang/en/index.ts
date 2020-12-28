import { KnownSymbols } from '@sora-substrate/util'

import { AccountMenu, AddAssetTabs, PasswordCondition, SourceTypes, WalletTabs, SettingsMenu, Languages } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create a wallet',
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
  assetNames: {
    [KnownSymbols.XOR]: 'Sora',
    [KnownSymbols.DOT]: 'Polkadot',
    [KnownSymbols.KSM]: 'Kusama',
    [KnownSymbols.USD]: 'USD',
    [KnownSymbols.VAL]: 'Sora Validator Asset',
    [KnownSymbols.PSWAP]: 'Polkaswap'
  },
  polkadotjs: {
    noExtensions: 'There is no Polkadot.js extension. You should install it before continue and reload this page\nhttps://polkadot.js.org/extension/',
    noAccounts: 'You haven\'t accounts in your Polkadot.js extension. Add the account before continue',
    noAccount: 'Something was happend with your account. Please check it in the Polkadot JS extension'
  },
  sourceType: {
    placeholder: 'Source type',
    [SourceTypes.MnemonicSeed]: 'Mnemonic seed',
    [SourceTypes.RawSeed]: 'Raw seed',
    [SourceTypes.PolkadotJs]: 'Polkadot.js'
  },
  connection: {
    title: 'Connect to a wallet',
    create: {
      title: 'Create a new wallet',
      hint: 'This will create a new wallet and seed phrase',
      action: '@:createWalletText'
    },
    import: {
      title: 'I already have a seed phrase',
      hint: 'Import your existing wallet using a mnemonic seed pharse, raw seed or JSON backup file',
      action: 'Import wallet'
    }
  },
  creation: {
    title: '@:createWalletText',
    name: {
      placeholder: '@:nameText',
      hint: 'The name for this account and how it will appear under your addresses. With an on-chain identity, it can be made available to others.'
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
      placeholder: 'Separate each word with a single space',
      hint: 'Enter your secret twelve word phrase here to restore your account.',
      name: {
        placeholder: '@:nameText',
        hint: 'The name for this account and how it will appear under your addresses. With an on-chain identity, it can be made available to others.'
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
    noAddress: 'No Address',
    badAddress: 'Incorrect Address',
    noAmount: 'No Amount',
    badAmount: 'Incorrect Amount',
    confirmTitle: 'Confirm transaction',
    confirm: '@:confirmText',
    errorAddress: 'Invalid address! Please check it and try again...',
    success: 'Transaction was submitted!'
  },
  account: {
    successCopy: 'Wallet address has been copied to the clipboard',
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
      desc: 'The default network for Ether transactions is Main Net',
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
      created: 'Transaction created with value of {amount} {symbol}',
      submitted: 'Transaction submitted with fee of {fee} {symbol}',
      confirmed: 'Transaction confirmed'
    }
  }
}
