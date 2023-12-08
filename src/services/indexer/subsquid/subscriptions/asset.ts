import { gql } from '@urql/core';

import type { SubsquidAssetEntity, SubsquidSubscriptionResponse } from '../types';

export const AssetRegistrationSubscription = gql<SubsquidSubscriptionResponse<SubsquidAssetEntity>>`
  subscription SubsquidFiatPriceSubscription {
    nodes: assets(limit: 10, orderBy: updatedAtBlock_DESC) {
      id
    }
  }
`;
