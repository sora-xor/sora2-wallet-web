export const ReferrerRewardsQuery = `
query(
  $filter: ReferrerRewardFilter
) {
  referrerRewards(filter: $filter) {
    groupedAggregates(groupBy: [REFERRAL]) {
      keys
      sum {
        amount
      }
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
