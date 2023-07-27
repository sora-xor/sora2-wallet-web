import type { CodecString, FPNumber } from '@sora-substrate/util';

export type ReferrerRewards = {
  rewards: FPNumber;
  invitedUserRewards: {
    [key: string]: {
      rewards: FPNumber;
    };
  };
};

export type FiatPriceObject = Record<string, CodecString>;

export type PoolApyObject = Record<string, string>;
