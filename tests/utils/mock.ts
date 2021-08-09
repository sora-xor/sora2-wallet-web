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
  assetSymbol?: string;
  symbolAsDecimal?: boolean;
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
    value: '1,234,567.890123'
  },
  {
    title: 'FontSizeRate Small',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.SMALL
  },
  {
    title: 'FontSizeRate Normal',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.NORMAL
  },
  {
    title: 'FontSizeRate Medium',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.MEDIUM
  },
  {
    title: 'FontWeightRate Small',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.SMALL
  },
  {
    title: 'FontWeightRate Normal',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.NORMAL
  },
  {
    title: 'FontWeightRate Medium',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.MEDIUM
  },
  {
    title: 'With asset symbol',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR
  },
  {
    title: 'Symbol In Decimal Container',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    symbolAsDecimal: true
  },
  {
    title: 'Is Fiat Value',
    value: '1,234,567.890123',
    isFiatValue: true
  },
  {
    title: 'Is Fiat Value Without Decimals',
    value: '1,234,567',
    isFiatValue: true
  },
  {
    title: 'Is Fiat Value With One Decimal Symbol',
    value: '1,234,567.8',
    isFiatValue: true
  },
  {
    title: 'Without Decimals',
    value: '1,234,567.890123',
    integerOnly: true
  },
  {
    title: 'With Left Shift',
    value: '1,234,567.890123',
    withLeftShift: true
  },
  {
    title: 'With Integer',
    value: '1,234,567'
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

interface FormattedAmountWithFiatValue {
  title: string;
  valueClass?: string;
  value: any;
  fontSizeRate?: string;
  fontWeightRate?: string;
  assetSymbol?: string;
  symbolAsDecimal?: boolean;
  integerOnly?: boolean;
  hasFiatValue?: boolean;
  fiatValue?: string;
  fiatFormatAsValue?: boolean;
  fiatFontSizeRate?: string;
  fiatFontWeightRate?: string;
  withLeftShift?: boolean;
}

export const MOCK_FORMATTED_AMOUNT_WITH_FIAT_VALUE: Array<FormattedAmountWithFiatValue> = [
  {
    title: 'With Empty Value',
    value: ''
  },
  {
    title: 'Value only',
    value: '1,234,567.890123'
  },
  {
    title: 'Value and Fiat value only',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'With value class',
    valueClass: 'formatted-amount--test',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'FontSizeRate Small',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.SMALL,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'FontWeightRate Small',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.SMALL,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'With asset symbol',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'Symbol In Decimal Container',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    symbolAsDecimal: true,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'Without Decimals',
    value: '1,234,567.890123',
    integerOnly: true,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'Has not Fiat Value',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
    hasFiatValue: false
  },
  {
    title: 'Fiat Format as Value Format Medium',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.MEDIUM,
    fontWeightRate: FontWeightRate.MEDIUM,
    fiatValue: '1,234,567.890123',
    fiatFormatAsValue: true
  },
  {
    title: 'Fiat FontSizeRate Medium',
    value: '1,234,567.890123',
    fiatFontSizeRate: FontSizeRate.MEDIUM,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'Fiat FontWeightRate Medium',
    value: '1,234,567.890123',
    fiatFontWeightRate: FontWeightRate.MEDIUM,
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'With Left Shift for Fiat',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
    withLeftShift: true
  }
]
