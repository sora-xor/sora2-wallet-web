import { FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsConnectionQuery, HistoryElementsQuery } from '../../queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from '../../queries/referrerRewards';
import { AccountHistorySubscription } from '../../subscriptions/account';

import { BaseModule } from './_base';

import type {
  ConnectionQueryResponseData,
  HistoryElement,
  QueryResponseData,
  ReferrerRewards,
  SubsquidHistoryElement,
} from '../../types';

export class SubsquidAccountModule extends BaseModule {
  /**
   * Get Referral Rewards items by referral
   */
  private async fetchAccountReferralRewards(referrer: string, after?: string | null) {
    const filter = referrerRewardsFilter(referrer);
    const variables = { after, filter };
    const response = await this.root.fetchEntitiesConnection(ReferrerRewardsQuery, variables);

    return response;
  }

  /**
   * Get Referral Rewards summarized by referral
   */
  public async getReferralRewards(referrer: string): Promise<Nullable<ReferrerRewards>> {
    const rewardsInfo: ReferrerRewards = {
      rewards: FPNumber.ZERO,
      invitedUserRewards: {},
    };

    let after: string | null = null;
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchAccountReferralRewards(referrer, after);

        if (!response) return null;

        after = response.pageInfo.endCursor;
        hasNextPage = response.pageInfo.hasNextPage;

        response.edges.forEach(({ node }) => {
          const referral = node.referral;
          const amount = FPNumber.fromCodecValue(node.amount, XOR.decimals);

          rewardsInfo.rewards = rewardsInfo.rewards.add(amount);

          if (!rewardsInfo.invitedUserRewards[referral]) {
            rewardsInfo.invitedUserRewards[referral] = { rewards: FPNumber.ZERO };
          }

          rewardsInfo.invitedUserRewards[referral].rewards =
            rewardsInfo.invitedUserRewards[referral].rewards.add(amount);
        });
      } while (hasNextPage);

      return rewardsInfo;
    } catch (error) {
      console.warn('Subsquid is not available or data is incorrect!', error);
      return null;
    }
  }

  public async getHistory(variables = {}): Promise<Nullable<QueryResponseData<HistoryElement>>> {
    return await this.root.fetchEntities(HistoryElementsQuery, variables);
  }

  public async getHistoryPaged(variables = {}): Promise<Nullable<ConnectionQueryResponseData<HistoryElement>>> {
    return await this.root.fetchEntitiesConnection(HistoryElementsConnectionQuery, variables);
  }

  public createHistorySubscription(accountAddress: string, handler: (entity: SubsquidHistoryElement) => void) {
    const variables = { id: [accountAddress] };
    const createSubscription = this.root.subscribe(AccountHistorySubscription, variables);

    return createSubscription(async (payload) => {
      if (payload.data?.nodes.length) {
        const txId = payload.data.nodes[0].latestHistoryElement.id;
        const variables = { filter: { id_eq: txId } };
        const response = await this.getHistory(variables);

        if (response && Array.isArray(response.nodes) && response.nodes[0]) {
          handler(response.nodes[0]);
        }
      }
    });
  }
}
