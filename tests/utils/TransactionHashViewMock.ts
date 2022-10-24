import { HashType, SoraNetwork } from '@/consts';

interface TxHashViewData {
  value: string;
  type: HashType;
  translation: string;
}

export const MOCK_TRANSACTION_HASH_VIEW: Array<TxHashViewData> = [
  {
    value: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    translation: 'transaction.txId',
    type: HashType.ID,
  },
  {
    value: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    translation: 'transaction.blockId',
    type: HashType.Block,
  },
  {
    value: '5ENwMXVzdA28AdGRkMhQVT8tGCuhh1KWvZ58yCLMuSTbZmur',
    translation: 'transaction.from',
    type: HashType.Account,
  },
  {
    value: 'cnToWyQbAUWygF6utv6vSqFfi6VKayKsvXEkbyLGKFBTRYbz8',
    translation: 'transaction.to',
    type: HashType.Account,
  },
  {
    value: '0x6F984C337aD5b7C2084805042AE942cef462e3ff',
    translation: 'transaction.to',
    type: HashType.EthAccount,
  },
  {
    value: '0x07f7ec4c5f2638a2ad25dc77445fd01ee2f2ba51d14fe79cdfb187b8674b2e80',
    translation: 'transaction.txId',
    type: HashType.EthTransaction,
  },
];
