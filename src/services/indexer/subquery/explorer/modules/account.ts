import { FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsQuery } from '../../queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from '../../queries/referrerRewards';
import { AccountHistorySubscription } from '../../subscriptions/account';

import { SubqueryBaseModule } from './_base';

import type {
  ConnectionQueryResponseData,
  HistoryElement,
  QueryResponseData,
  ReferrerRewards,
  SubqueryHistoryElement,
} from '../../types';

export class SubqueryAccountModule extends SubqueryBaseModule {
  /**
   * Get Referral Rewards items by referral
   */
  private async fetchAccountReferralRewards(referrer: string, after?: string) {
    const filter = referrerRewardsFilter(referrer);
    const variables = { after, filter };
    const response = await this.root.fetchEntities(ReferrerRewardsQuery, variables);

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

    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchAccountReferralRewards(referrer, after);

        if (!response) return null;

        after = response.pageInfo.endCursor;
        hasNextPage = response.pageInfo.hasNextPage;

        response.edges.forEach((edge) => {
          const node = edge.node;
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
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  public async getHistory(variables = {}): Promise<Nullable<QueryResponseData<HistoryElement>>> {
    const data = await this.getHistoryPaged(variables);
    if (data) {
      return {
        nodes: data.edges.map((edge) => edge.node),
        totalCount: data.totalCount,
      };
    }
    return data;
  }

  public async getHistoryPaged(variables = {}): Promise<Nullable<ConnectionQueryResponseData<HistoryElement>>> {
    return await this.root.fetchEntities(HistoryElementsQuery, variables);
  }

  public createHistorySubscription(accountAddress: string, handler: (entity: SubqueryHistoryElement) => void) {
    const variables = { id: [accountAddress] };
    const createSubscription = this.root.subscribe(AccountHistorySubscription, variables);

    return createSubscription(async (payload) => {
      if (payload.data) {
        const txId = payload.data.payload._entity.latest_history_element_id;
        const variables = { filter: { id: { equalTo: txId } } };
        const response = await this.getHistory(variables);

        if (response && Array.isArray(response.nodes) && response.nodes[0]) {
          handler(response.nodes[0]);
        }
      }
    });
  }
}
