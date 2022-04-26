import { KnownSymbols } from '@sora-substrate/util/build/assets/consts';

import { FontSizeRate, FontWeightRate } from '@/consts';

interface FormattedAmount {
  title: string;
  value: any;
  fontSizeRate?: FontSizeRate;
  fontWeightRate?: FontWeightRate;
  assetSymbol?: string;
  symbolAsDecimal?: boolean;
  isFiatValue?: boolean;
  integerOnly?: boolean;
  withLeftShift?: boolean;
  valueCanBeHidden?: boolean;
  fiatDefaultRounding?: boolean;
}

export const MOCK_FORMATTED_AMOUNT: Array<FormattedAmount> = [
  {
    title: 'With Empty Value',
    value: '',
  },
  {
    title: 'Value only',
    value: '1,234,567.890123',
  },
  {
    title: 'FontSizeRate Small',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.SMALL,
  },
  {
    title: 'FontSizeRate Normal',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.NORMAL,
  },
  {
    title: 'FontSizeRate Medium',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.MEDIUM,
  },
  {
    title: 'FontWeightRate Small',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.SMALL,
  },
  {
    title: 'FontWeightRate Normal',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.NORMAL,
  },
  {
    title: 'FontWeightRate Medium',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.MEDIUM,
  },
  {
    title: 'With asset symbol',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
  },
  {
    title: 'Symbol In Decimal Container',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    symbolAsDecimal: true,
  },
  {
    title: 'Is Fiat Value',
    value: '1,234,567.890123',
    isFiatValue: true,
  },
  {
    title: 'Is Fiat Value Without Decimals',
    value: '1,234,567',
    isFiatValue: true,
  },
  {
    title: 'Is Fiat Value With One Decimal Symbol',
    value: '1,234,567.8',
    isFiatValue: true,
  },
  {
    title: 'Is Fiat Value With Two Decimal Symbols (default rounding)',
    value: '0.09',
    isFiatValue: true,
    fiatDefaultRounding: true,
  },
  {
    title: 'Is Small Fiat Value With Two Decimal Symbols (default rounding)',
    value: '0.009',
    isFiatValue: true,
    fiatDefaultRounding: true,
  },
  {
    title: 'Without Decimals',
    value: '1,234,567.890123',
    integerOnly: true,
  },
  {
    title: 'With Left Shift',
    value: '1,234,567.890123',
    withLeftShift: true,
  },
  {
    title: 'With Integer',
    value: '1,234,567',
  },
  {
    title: 'With 0 Value',
    value: 0,
  },
  {
    title: 'With "0" Value',
    value: '0',
  },
  {
    title: 'With undefined Value',
    value: undefined,
  },
  {
    title: 'With NaN Value',
    value: NaN,
  },
  {
    title: 'With "NaN" Value',
    value: 'NaN',
  },
  {
    title: 'With Infinity Value',
    value: Infinity,
  },
  {
    title: 'With Empty Value, value can be hidden',
    value: '',
    valueCanBeHidden: true,
  },
  {
    title: 'Value only, value can be hidden',
    value: '1,234,567.890123',
    valueCanBeHidden: true,
  },
  {
    title: 'FontSizeRate Small, value can be hidden',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.SMALL,
    valueCanBeHidden: true,
  },
  {
    title: 'FontSizeRate Normal, value can be hidden',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.NORMAL,
    valueCanBeHidden: true,
  },
  {
    title: 'FontSizeRate Medium, value can be hidden',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.MEDIUM,
    valueCanBeHidden: true,
  },
  {
    title: 'FontWeightRate Small, value can be hidden',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.SMALL,
    valueCanBeHidden: true,
  },
  {
    title: 'FontWeightRate Normal, value can be hidden',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.NORMAL,
    valueCanBeHidden: true,
  },
  {
    title: 'FontWeightRate Medium, value can be hidden',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.MEDIUM,
    valueCanBeHidden: true,
  },
  {
    title: 'With asset symbol, value can be hidden',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    valueCanBeHidden: true,
  },
  {
    title: 'Symbol In Decimal Container, value can be hidden',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    symbolAsDecimal: true,
    valueCanBeHidden: true,
  },
  {
    title: 'Is Fiat Value, value can be hidden',
    value: '1,234,567.890123',
    isFiatValue: true,
    valueCanBeHidden: true,
  },
  {
    title: 'Is Fiat Value Without Decimals, value can be hidden',
    value: '1,234,567',
    isFiatValue: true,
    valueCanBeHidden: true,
  },
  {
    title: 'Is Fiat Value With One Decimal Symbol, value can be hidden',
    value: '1,234,567.8',
    isFiatValue: true,
    valueCanBeHidden: true,
  },
  {
    title: 'Without Decimals, value can be hidden',
    value: '1,234,567.890123',
    integerOnly: true,
    valueCanBeHidden: true,
  },
  {
    title: 'With Left Shift, value can be hidden',
    value: '1,234,567.890123',
    withLeftShift: true,
    valueCanBeHidden: true,
  },
  {
    title: 'With Integer, value can be hidden',
    value: '1,234,567',
    valueCanBeHidden: true,
  },
  {
    title: 'With 0 Value, value can be hidden',
    value: 0,
    valueCanBeHidden: true,
  },
  {
    title: 'With "0" Value, value can be hidden',
    value: '0',
    valueCanBeHidden: true,
  },
  {
    title: 'With undefined Value, value can be hidden',
    value: undefined,
    valueCanBeHidden: true,
  },
  {
    title: 'With NaN Value, value can be hidden',
    value: NaN,
    valueCanBeHidden: true,
  },
  {
    title: 'With "NaN" Value, value can be hidden',
    value: 'NaN',
    valueCanBeHidden: true,
  },
  {
    title: 'With Infinity Value, value can be hidden',
    value: Infinity,
    valueCanBeHidden: true,
  },
];
