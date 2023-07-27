import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { ReferrerRewardEntity, EntitiesConnectionQueryResponse } from '../types';

export const ReferrerRewardsQuery = gql<EntitiesConnectionQueryResponse<ReferrerRewardEntity>>`
  query ReferrerRewardsQuery($first: Int = 100, $filter: ReferrerRewardWhereInput, $after: String = null) {
    entities: referrerRewards(first: $first, where: $filter, after: $after) {
      pageInfo {
        ...PageInfoFragment
      }
      edges {
        node {
          referral
          amount
        }
      }
    }
  }
  ${PageInfoFragment}
`;

export const referrerRewardsFilter = (referrer?: string) => {
  if (!referrer) return undefined;

  return {
    referrer_eq: referrer,
  };
};
