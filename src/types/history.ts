import type { Operation } from '@sora-substrate/util';

export type ExternalHistoryParams = {
  next?: boolean;
  address?: string;
  isLtrDirection?: boolean;
  assetAddress?: string;
  pageAmount?: number;
  page?: number;
  query?: {
    search?: string;
    operationNames?: Operation[];
    assetsAddresses?: string[];
  };
};
