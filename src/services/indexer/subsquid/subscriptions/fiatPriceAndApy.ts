import { gql } from '@urql/core';

import type { SubsquidAssetEntity, SubsquidPoolXYKEntity, SubsquidSubscriptionResponse } from '../types';

export const FiatPriceSubscription = gql<SubsquidSubscriptionResponse<SubsquidAssetEntity>>`
  subscription SubsquidFiatPriceSubscription {
    nodes: assets(limit: 10, orderBy: updatedAtBlock_DESC) {
      id
      liquidity
      priceUSD
      supply
    }
  }
`;

export const PoolsApySubscription = gql<SubsquidSubscriptionResponse<SubsquidPoolXYKEntity>>`
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
