import { HashType, SoraNetwork } from '@/consts'

interface TxHashViewData {
  value: string;
  type: HashType;
  translation: string;
}

export const MOCK_TRANSACTION_HASH_VIEW: Array<TxHashViewData> = [
  {
    value: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    translation: 'any',
    type: HashType.ID
  },
  {
    value: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    translation: 'any',
    type: HashType.Block
  },
  {
    value: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    translation: 'any',
    type: HashType.Account
  }
]
