import { AppWallet } from '@/consts';

import type { PolkadotJsAccount } from '../../src/types/common';

export const MOCK_ACCOUNT_POLKADOT: PolkadotJsAccount = {
  address: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
  name: 'Polkadot Name',
  source: AppWallet.PolkadotJS,
};

export const MOCK_ACCOUNT: PolkadotJsAccount = {
  address: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
  name: 'Sora Name',
  source: AppWallet.PolkadotJS,
};

export const MOCK_ADDRESS = {
  formattedSora: 'cnRXua6zs8TaE87BQFL6uWVbT2g6GXsUjwk6PTvL6UHcHDCvo',
  formatted: 'cnRXua6zs8Ta...TvL6UHcHDCvo',
};
