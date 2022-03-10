export const ReferrerRewardsQuery = `
query (
  $first: Int = 100
  $filter: ReferrerRewardFilter
  $after: Cursor = ""
) {
  referrerRewards (
    first: $first
    filter: $filter
    after: $after
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      blockHeight
      referral
      referrer
      timestamp
      amount
    }
  }
}`;

export const referrerRewardsFilter = (referrer?: string) => {
  if (!referrer) return undefined;

  return {
    referrer: {
      equalTo: referrer,
    },
  };
};
