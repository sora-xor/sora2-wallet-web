export const ReferrerRewardsQuery = `
query($filter: ReferrerRewardFilter) {
  referrerRewards(filter: $filter) {
    nodes {
      id
      blockHeight
      referrer
      referree
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
