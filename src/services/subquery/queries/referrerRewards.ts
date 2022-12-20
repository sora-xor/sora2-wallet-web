import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { AccountReferralReward, EntitiesQueryResponse } from '../types';

export const ReferrerRewardsQuery = gql<EntitiesQueryResponse<AccountReferralReward>>`
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
