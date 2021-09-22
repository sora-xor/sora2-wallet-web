import { Asset, AccountAsset, FPNumber, KnownSymbols, History, TransactionStatus, Operation, WhitelistArrayItem, api } from '@sora-substrate/util'

import type { Account } from '@/types/common'

export const MOCK_NETWORK_FEE: {} = api.NetworkFee

export const MOCK_ACCOUNT_ASSETS: Array<AccountAsset> = [
  {
    address: '0x0200000000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.XOR,
    name: 'SORA',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '123400000000000000000',
      total: '123400000000000000000',
      reserved: '0',
      frozen: '0',
      locked: '0'
    }
  },
  {
    address: '0x0200040000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.VAL,
    name: 'SORA Validator Token',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '0',
      total: '0',
      reserved: '0',
      frozen: '0',
      locked: '0'
    }
  },
  {
    address: '0x0200050000000000000000000000000000000000000000000000000000000000',
    symbol: KnownSymbols.PSWAP,
    name: 'Polkaswap',
    decimals: FPNumber.DEFAULT_PRECISION,
    balance: {
      transferable: '1000000000000',
      total: '1000000000000',
      reserved: '0',
      frozen: '0',
      locked: '0'
    }
  }
]

export const MOCK_ASSETS: Array<Asset> = [
  {
    address: '0x0212350000000000000000000000000000000000000000000000000000000000',
    symbol: 'TEST',
    name: 'Test Asset',
    decimals: FPNumber.DEFAULT_PRECISION
  }
]

export const MOCK_HISTORY: Array<History> = [
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    txId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6D7',
    status: TransactionStatus.Finalized,
    type: Operation.Transfer,
    startTime: 1605048643745,
    amount: '0.1',
    symbol: KnownSymbols.XOR,
    from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K',
    to: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD'
  },
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Error,
    errorMessage: 'Test error message!',
    type: Operation.Swap,
    startTime: 1605048643745,
    amount: '0.1',
    amount2: '0.9',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K'
  },
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.AddLiquidity,
    startTime: 1605048643745,
    amount: '0.1',
    amount2: '0.9',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K'
  },
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.RemoveLiquidity,
    startTime: 1605048643745,
    amount: '100.123',
    symbol: KnownSymbols.XOR,
    symbol2: KnownSymbols.PSWAP,
    from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K'
  },
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
    status: TransactionStatus.Finalized,
    type: Operation.RegisterAsset,
    startTime: 1605048643745,
    symbol: 'TEST',
    from: '5HVmWWpBi69cmmDqWE4R6yxxJ2pveRnfozNg5K'
  }
]

export const MOCK_ACCOUNTS: any = [
  {
    address: 'dfsakljfdlkjfhfkjladshslfjafds',
    name: 'Mock Account',
    password: '123qwaszx'
  },
  {
    address: '5FbFx7AoLdnyMbKCbVZVZqXcZQkhy4HDKnerSW4oKeEQb6pL',
    name: 'Not SORA Account',
    password: '123qwaszx'
  }
]

export const MOCK_WHITE_LIST: Array<WhitelistArrayItem> = [
  {
    symbol: 'XOR',
    name: 'SORA',
    address: '0x0200000000000000000000000000000000000000000000000000000000000000',
    decimals: 18,
    icon: "data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22' %3E%3Cpath fill='%23E3232C' d='M22,11c0,6.1-4.9,11-11,11S0,17.1,0,11S4.9,0,11,0S22,4.9,22,11z'/%3E%3Cpath fill='%23FFFFFF' d='M5.8,20.7c1.7-2.6,3.5-5.2,5.3-7.8l5.2,7.8c0.3-0.1,0.5-0.3,0.8-0.5s0.5-0.3,0.7-0.5 c-1.9-2.9-3.9-5.8-5.8-8.7h5.8V9.2H12V7.3h5.8V5.5H4.3v1.8h5.8v1.9H4.3V11h5.8l-5.8,8.7C4.5,19.9,4.7,20,5,20.2 C5.3,20.4,5.5,20.6,5.8,20.7z'/%3E%3C/svg%3E"
  }
]

export const MOCK_FIAT_PRICE_AND_APY_OBJECT: any = {
  '0x0200000000000000000000000000000000000000000000000000000000000000': {
    price: '1230000000000000000'
  }
}

export const MOCK_SORA_NETWORK = 'Dev'

export const MOCK_ACCOUNT: Account = {
  address: '',
  name: '',
  isExternal: true
}
