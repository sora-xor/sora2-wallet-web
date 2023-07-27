import { gql } from '@urql/core';

import type { SubsquidAssetEntity, SubsquidPoolXYKEntity, SubscriptionResponse } from '../types';

export const FiatPriceSubscription = gql<SubscriptionResponse<SubsquidAssetEntity>>`
  subscription SubsquidFiatPriceSubscription {
    nodes: assets(limit: 10, orderBy: updatedAtBlock_DESC) {
      id
      liquidity
      priceUSD
      supply
    }
  }
`;

export const PoolsApySubscription = gql<SubscriptionResponse<SubsquidPoolXYKEntity>>`
  subscription SubsquidPoolsApySubscription {
    nodes: poolXYKs(limit: 10, orderBy: updatedAtBlock_DESC) {
      baseAsset {
        id
        priceUSD
        supply
        liquidity
      }
      targetAsset {
        id
        priceUSD
        supply
        liquidity
      }
    }
  }
`;
