import { FPNumber } from '@sora-substrate/sdk';

interface WalletFee {
  title: string;
  value: FPNumber;
}

export const MOCK_WALLET_FEE: Array<WalletFee> = [
  {
    title: 'With Value',
    value: new FPNumber('1234567.890123'),
  },
  {
    title: 'With "0" Value',
    value: new FPNumber('0'),
  },
  {
    title: 'With "NaN" Value',
    value: new FPNumber('NaN'),
  },
  {
    title: 'With "Infinity" Value',
    value: new FPNumber('Infinity'),
  },
];
