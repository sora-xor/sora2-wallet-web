import { AccountAsset, FPNumber, KnownSymbols, History, TransactionStatus, Operation } from '@sora-substrate/util'

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

export const MOCK_HISTORY: Array<History> = [
  {
    id: '1',
    blockId: '0xB8c77482e45F1F4d123DeRwQ5F52C74426C6DD',
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
