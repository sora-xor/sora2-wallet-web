import type { Operation } from '@sora-substrate/util';

export type CursorPagination = {
  startCursor: string;
  endCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

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
