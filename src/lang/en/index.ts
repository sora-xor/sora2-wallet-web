import { AccountMenu, PasswordCondition, SourceTypes, WalletTabs } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create a Wallet',
  nameText: 'Name',
  nextText: 'Next',
  importText: 'Import',
  settingsText: 'Settings',
  addTokenText: 'Add token',
  comingSoonText: 'Coming soon',
  successText: 'Success',
  warningText: 'Warning',
  menuText: 'Menu',
  sourceType: {
    placeholder: 'Source type',
    [SourceTypes.MnemonicSeed]: 'Mnemonic seed',
    [SourceTypes.RawSeed]: 'Raw seed'
  },
  connection: {
    title: 'Connect to a Wallet',
    create: {
      title: 'Create a new wallet',
      hint: 'This will create a new wallet and seed phrase',
      action: '@:createWalletText'
    },
    import: {
      title: 'I already have a seed phrase',
      hint: 'Import your existing wallet using a mnemonic seed pharse, raw seed or JSON backup file',
      action: 'Import Wallet'
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
    title: 'Import a Wallet',
    sourceType: {
      placeholder: '@:sourceType.placeholder',
      [SourceTypes.MnemonicSeed]: `@:sourceType.${SourceTypes.MnemonicSeed}`,
      [SourceTypes.RawSeed]: `@:sourceType.${SourceTypes.RawSeed}`
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
  settings: {
    title: '@:settingsText'
  }
}
