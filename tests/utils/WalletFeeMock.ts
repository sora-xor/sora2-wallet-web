interface WalletFee {
  title: string;
  value: string;
}

export const MOCK_WALLET_FEE: Array<WalletFee> = [
  {
    title: 'With Value',
    value: '1,234,567.890123'
  },
  {
    title: 'With "0" Value',
    value: '0'
  },
  {
    title: 'With "NaN" Value',
    value: 'NaN'
  },
  {
    title: 'With "Infinity" Value',
    value: 'Infinity'
  }
]
