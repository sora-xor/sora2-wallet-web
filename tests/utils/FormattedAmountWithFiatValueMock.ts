import { KnownSymbols } from '@sora-substrate/util';

import { FontSizeRate, FontWeightRate } from '@/consts';

interface FormattedAmountWithFiatValue {
  title: string;
  valueClass?: string;
  value: any;
  fontSizeRate?: FontSizeRate;
  fontWeightRate?: FontWeightRate;
  assetSymbol?: string;
  symbolAsDecimal?: boolean;
  hasFiatValue?: boolean;
  fiatValue?: string;
  fiatFormatAsValue?: boolean;
  fiatFontSizeRate?: FontSizeRate;
  fiatFontWeightRate?: FontWeightRate;
  withLeftShift?: boolean;
  valueCanBeHidden?: boolean;
}

export const MOCK_FORMATTED_AMOUNT_WITH_FIAT_VALUE: Array<FormattedAmountWithFiatValue> = [
  {
    title: 'With Empty Value',
    value: '',
  },
  {
    title: 'Value only',
    value: '1,234,567.890123',
  },
  {
    title: 'Value only, can be hidden',
    value: '1,234,567.890123',
    valueCanBeHidden: true,
  },
  {
    title: 'Value and Fiat value only',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'Value and Fiat value only, can be hidden',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
    valueCanBeHidden: true,
  },
  {
    title: 'With value class',
    valueClass: 'formatted-amount--test',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'FontSizeRate Small',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.SMALL,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'FontWeightRate Small',
    value: '1,234,567.890123',
    fontWeightRate: FontWeightRate.SMALL,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'With asset symbol',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'Symbol In Decimal Container',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR,
    symbolAsDecimal: true,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'Has not Fiat Value',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
    hasFiatValue: false,
  },
  {
    title: 'Fiat Format as Value Format Medium',
    value: '1,234,567.890123',
    fontSizeRate: FontSizeRate.MEDIUM,
    fontWeightRate: FontWeightRate.MEDIUM,
    fiatValue: '1,234,567.890123',
    fiatFormatAsValue: true,
  },
  {
    title: 'Fiat FontSizeRate Medium',
    value: '1,234,567.890123',
    fiatFontSizeRate: FontSizeRate.MEDIUM,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'Fiat FontWeightRate Medium',
    value: '1,234,567.890123',
    fiatFontWeightRate: FontWeightRate.MEDIUM,
    fiatValue: '1,234,567.890123',
  },
  {
    title: 'With Left Shift for Fiat',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123',
    withLeftShift: true,
  },
];
