import { AccountAsset, FPNumber, KnownSymbols, History, TransactionStatus, Operation } from '@sora-substrate/util'

import { FontSizeRate, FontWeightRate } from '../../src/types'

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

interface FormattedAmount {
  title: string;
  value: any;
  fontSizeRate?: string;
  fontWeightRate?: string;
  isFiatValue?: boolean;
  integerOnly?: boolean;
  withLeftShift?: boolean;
}

export const MOCK_FORMATTED_AMOUNT: Array<FormattedAmount> = [
  {
    title: 'With Empty Value',
    value: ''
  },
  {
    title: 'Value only',
    value: '1234.5678'
  },
  {
    title: 'FontSizeRate Small',
    value: '1234.5678',
    fontSizeRate: FontSizeRate.SMALL
  },
  {
    title: 'FontSizeRate Normal',
    value: '1234.5678',
    fontSizeRate: FontSizeRate.NORMAL
  },
  {
    title: 'FontSizeRate Medium',
    value: '1234.5678',
    fontSizeRate: FontSizeRate.MEDIUM
  },
  {
    title: 'FontWeightRate Small',
    value: '1234.5678',
    fontSizeRate: FontWeightRate.SMALL
  },
  {
    title: 'FontWeightRate Normal',
    value: '1234.5678',
    fontSizeRate: FontWeightRate.NORMAL
  },
  {
    title: 'FontWeightRate Medium',
    value: '1234.5678',
    fontSizeRate: FontWeightRate.MEDIUM
  },
  {
    title: 'Is Fiat Value',
    value: '1234.5678',
    isFiatValue: true
  },
  {
    title: 'Without Decimals',
    value: '1234.5678',
    integerOnly: true
  },
  {
    title: 'With Left Shift',
    value: '1234.5678',
    withLeftShift: true
  },
  {
    title: 'With 0 Value',
    value: 0
  },
  {
    title: 'With "0" Value',
    value: '0'
  },
  {
    title: 'With undefined Value',
    value: undefined
  },
  {
    title: 'With NaN Value',
    value: NaN
  },
  {
    title: 'With "NaN" Value',
    value: 'NaN'
  },
  {
    title: 'With Infinity Value',
    value: Infinity
  }
]
