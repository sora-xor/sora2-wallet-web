import { MOCK_ACCOUNTS } from '../utils/mock'

export interface WalletSend {
  title: string;
  step: number;
  address: string;
  amount: string;
}

export const MOCK_WALLET_SEND: Array<WalletSend> = [
  {
    title: 'Create Step: Empty Fields',
    step: 1,
    address: '',
    amount: ''
  },
  {
    title: 'Create Step: Incorrect Address',
    step: 1,
    address: '12345',
    amount: ''
  },
  {
    title: 'Create Step: The Same Account',
    step: 1,
    address: MOCK_ACCOUNTS[0].address,
    amount: ''
  },
  {
    title: 'Create Step: Not SORA Address',
    step: 1,
    address: MOCK_ACCOUNTS[1].address,
    amount: ''
  },
  {
    title: 'Confirm Step',
    step: 2,
    address: '',
    amount: '10000000000'
  }
]
