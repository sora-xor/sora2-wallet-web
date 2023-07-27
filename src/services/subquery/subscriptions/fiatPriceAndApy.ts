import { gql } from '@urql/core';

import type { AssetEntity, PoolXYKEntity, SubscriptionResponse } from '../types';

export const FiatPriceSubscription = gql<SubscriptionResponse<AssetEntity>>`
  subscription {
    nodes: assets(limit: 50, orderBy: updatedAtBlock_DESC) {
      poolXYK {
        id
        baseAssetId
        targetAssetId
        baseAssetReserves
        targetAssetReserves
        multiplier
        priceUSD
        strategicBonusApy
      }
      data {
        id
        assetId
        priceUSD {
          low
          high
          open
          close
        }
        volume {
          amount
          amountUSD
        }
        timestamp
        type
        liquidity
        supply
        mint
        burn
      }
    }
  }
`;

export const PoolsApySubscription = gql<SubscriptionResponse<PoolXYKEntity>>`
  subscription {
    nodes: poolXYKs(limit: 50, orderBy: updatedAtBlock_DESC) {
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
