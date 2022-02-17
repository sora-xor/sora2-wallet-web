export const ReferrerRewardsQuery = `
query($filter: ReferrerRewardFilter) {
  referrerRewards(filter: $filter) {
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

export const referrerRewardsFilter = (referrer = '') => {
  return {
    referrer: {
      equalTo: referrer,
    },
  };
};
