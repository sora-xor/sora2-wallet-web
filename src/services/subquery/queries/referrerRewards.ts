import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { ReferrerRewardEntity, EntitiesQueryResponse } from '../types';

export const ReferrerRewardsQuery = gql<EntitiesQueryResponse<ReferrerRewardEntity>>`
  query ReferrerRewardsQuery($first: Int = 100, $filter: ReferrerRewardFilter, $after: Cursor = "") {
    entities: referrerRewards(first: $first, filter: $filter, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      nodes {
        referral
        amount
      }
    }
  }
  ${PageInfoFragment}
`;

export const referrerRewardsFilter = (referrer?: string) => {
  if (!referrer) return undefined;

  return {
    referrer: {
      equalTo: referrer,
    },
  };
};
