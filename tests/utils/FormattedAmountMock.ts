import { KnownSymbols } from '@sora-substrate/util'
import { FontSizeRate, FontWeightRate } from '../../src/types'

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
