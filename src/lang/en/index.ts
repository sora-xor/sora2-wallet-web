import { AccountMenu, AddTokenTabs, PasswordCondition, SourceTypes, WalletTabs, SettingsMenu, Languages } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create a wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addTokenText: 'Add token',
  comingSoonText: 'Coming soon',
  successText: 'Success',
  warningText: 'Warning',
  menuText: 'Menu',
  swapText: 'Swap',
  searchText: 'Search',
  cancelText: 'Cancel',
  saveText: 'Save',
  logoutText: 'Log out',
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
      hint: 'Enter your secret twelve word phrase here to erstore your account.',
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
        [PasswordCondition.Digit]: 'At least 1 digit'
      },
      repeatedPassword: {
        placeholder: 'Repeat password'
      }
    },
    [SourceTypes.RawSeed]: {
      placeholder: 'Seed (hex or string)',
      hint: 'Enter your seed here to erstore your account.'
    },
    action: '@:importText'
  },
  wallet: {
    title: 'Wallet',
    [WalletTabs.Assets]: 'Assets',
    [WalletTabs.Activity]: 'Activity',
    addToken: '@:addTokenText'
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
    swap: '@:swapText'
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
        address: 'Address',
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
  addToken: {
    title: '@:addTokenText',
    cancel: '@:cancelText',
    action: '@:addTokenText',
    success: 'Token was added successfully!',
    [AddTokenTabs.Search]: {
      title: '@:searchText',
      placeholder: 'Search Token Name, Symbol, or Address',
      info: 'Add the tokens you\'ve acquired using MetaMask',
      empty: 'No tokens found'
    },
    [AddTokenTabs.Custom]: {
      title: 'Custom token',
      addressPlaceholder: 'Address',
      symbolPlaceholder: 'Token symbol'
    }
  },
  transaction: {
    title: 'Transaction details',
    hash: 'Transaction Hash',
    status: 'Status',
    date: 'Date',
    amount: 'Amount',
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
