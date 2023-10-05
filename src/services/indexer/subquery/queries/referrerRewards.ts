import { gql } from '@urql/core';

import { PageInfoFragment } from '../fragments/pageInfo';

import type { ReferrerRewardEntity, SubqueryConnectionQueryResponse } from '../types';

export const ReferrerRewardsQuery = gql<SubqueryConnectionQueryResponse<ReferrerRewardEntity>>`
  query SubqueryReferrerRewardsQuery($first: Int = 100, $filter: ReferrerRewardFilter, $after: Cursor = "") {
    data: referrerRewards(first: $first, filter: $filter, after: $after) {
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
    referrer: {
      equalTo: referrer,
    },
  };
};
