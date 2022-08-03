import type { Operation } from '@sora-substrate/util';

export type ExternalHistoryParams = {
  next?: boolean;
  address?: string;
  assetAddress?: string;
  pageAmount?: number;
  query?: {
    search?: string;
    operationNames?: Operation[];
    assetsAddresses?: string[];
  };
};
