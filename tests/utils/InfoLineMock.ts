import { KnownSymbols } from '@sora-substrate/util'

interface InfoLine {
  title: string;
  label: string;
  labelTooltip?: string;
  value: string;
  assetSymbol?: string;
  isFormatted?: boolean;
  fiatValue?: string;
}

export const MOCK_INFO_LINE: Array<InfoLine> = [
  {
    title: 'With Empty Label and Value',
    label: '',
    value: ''
  },
  {
    title: 'Label and Value',
    label: 'Label',
    value: '1,234,567.890123'
  },
  {
    title: 'With Label Tooltip',
    label: 'Label',
    labelTooltip: 'Label tooltip',
    value: '1,234,567.890123'
  },
  {
    title: 'With Asset Symbol',
    label: 'Label',
    value: '1,234,567.890123',
    assetSymbol: KnownSymbols.XOR
  },
  {
    title: 'With Formatted Value',
    label: 'Label',
    value: '1,234,567.890123456789',
    isFormatted: true
  },
  {
    title: 'With Fiat Value',
    label: 'Label',
    value: '1,234,567.890123',
    fiatValue: '1,234,567.890123'
  },
  {
    title: 'With "0" Value',
    label: 'Label',
    value: '0'
  },
  {
    title: 'With "NaN" Value',
    label: 'Label',
    value: 'NaN'
  },
  {
    title: 'With "Infinity" Value',
    label: 'Label',
    value: 'Infinity'
  },
  {
    title: 'With "-Infinity" Value',
    label: 'Label',
    value: '-Infinity'
  }
]
