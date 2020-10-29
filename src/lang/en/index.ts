import { SourceTypes } from '../../consts'

export default {
  closeText: 'Close',
  backText: 'Back',
  createWalletText: 'Create a Wallet',
  nameText: 'Name',
  nextText: 'Next',
  comingSoonText: 'Coming soon',
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
      placeholder: 'Source type',
      [SourceTypes.MnemonicSeed]: 'Mnemonic seed',
      hint: 'Please write down your wallet\'s seed and keep it in a safe place. The seed can be used to restore your wallet.'
    },
    action: '@:nextText'
  }
}
