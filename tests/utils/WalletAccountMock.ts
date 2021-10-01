import { Account, PolkadotJsAccount } from '@/types/common';

export const MOCK_ACCOUNT_POLKADOT: PolkadotJsAccount = {
  address: '0x0200000000000000000000000000000000000000000000000000000000000000',
  name: 'Polkadot Name',
};

export const MOCK_ACCOUNT: Account = {
  address: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
  name: 'Sora Name',
  isExternal: true,
};

export const MOCK_ADDRESS = {
  original: '0x0200000000000000000000000000000000000000000000000000000000000000',
  formattedSora: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
  formatted: 'cnRXua6zs8Ta...TvL6UHcHDCvo',
};
