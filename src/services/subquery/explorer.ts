import { axiosInstance, FPNumber } from '@sora-substrate/util';

import { HistoryElementsQuery, noirHistoryElementsFilter } from './queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from './queries/referrerRewards';
import { ChartsFiatPriceQuery, chartsPoolXykEntityFilter } from './queries/chartsFiatPrice';
import { SoraNetwork } from '../../consts';
import type { Explorer, PoolXYKEntity, FiatPriceAndApyObject, ReferrerRewards, ReferrerReward } from './types';

import store from '../../store';
import { FiatPriceQuery, poolXykEntityFilter } from './queries/fiatPriceAndApy';

export default class SubqueryExplorer implements Explorer {
  public static getApiUrl(soraNetwork?: SoraNetwork): string {
    switch (soraNetwork) {
      case SoraNetwork.Prod:
        return 'https://api.subquery.network/sq/sora-xor/sora';
      case SoraNetwork.Stage:
        return 'https://api.subquery.network/sq/sora-xor/sora-staging';
      case SoraNetwork.Test:
        return 'https://subquery.q1.tst.sora2.soramitsu.co.jp';
      case SoraNetwork.Dev:
      default:
        return 'https://api.subquery.network/sq/sora-xor/sora-dev';
    }
  }

  public get soraNetwork(): SoraNetwork {
    return store.getters.soraNetwork;
  }

  public async getAccountTransactions(variables = {}): Promise<any> {
    const { historyElements } = await this.request(HistoryElementsQuery, variables);

    return historyElements;
  }

  /**
   * Fetch pools from poolXykEntity
   * @param poolXykEntityId poolXykEntity id
   * @param poolsAfter cursor of last element
   */
  public async fetchPools(
    poolXykEntityId?: string,
    poolsAfter?: string
  ): Promise<Nullable<{ id: string; hasNextPage: boolean; endCursor: string; nodes: PoolXYKEntity[] }>> {
    try {
      const params = {
        poolsAfter,
        filter: poolXykEntityFilter(poolXykEntityId),
      };

      const { poolXYKEntities } = await this.request(FiatPriceQuery, params);

      if (!poolXYKEntities) return null;

      const {
        id,
        pools: {
          pageInfo: { hasNextPage, endCursor },
          nodes,
        },
      } = poolXYKEntities.nodes[0];

      return { id, hasNextPage, endCursor, nodes };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get fiat price & APY coefficient for each asset (without historical data)
   */
  public async getFiatPriceAndApyObject(): Promise<Nullable<FiatPriceAndApyObject>> {
    const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

    const acc: FiatPriceAndApyObject = {};

    let poolXykEntityId = '';
    let poolsAfter = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchPools(poolXykEntityId, poolsAfter);

        if (!response) {
          return poolXykEntityId ? acc : null;
        }

        poolXykEntityId = response.id;
        poolsAfter = response.endCursor;
        hasNextPage = response.hasNextPage;

        response.nodes.forEach((el: PoolXYKEntity) => {
          const strategicBonusApyFPNumber = format(el.strategicBonusApy);
          const priceFPNumber = format(el.priceUSD);
          const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
          const isPriceFinity = priceFPNumber.isFinity();
          if (isPriceFinity || isStrategicBonusApyFinity) {
            acc[el.targetAssetId] = {};
          }
          if (isPriceFinity) {
            acc[el.targetAssetId].price = priceFPNumber.toCodecString();
          }
          if (isStrategicBonusApyFinity) {
            acc[el.targetAssetId].strategicBonusApy = strategicBonusApyFPNumber.toCodecString();
          }
        });
      } while (hasNextPage);

      return acc;
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Fetch pools for Charts prices
   * @param poolXykEntityId poolXykEntity id
   * @param assetId
   */
  public async fetchChartsPrice(
    poolXykEntityId?: string,
    assetId?: string
  ): Promise<Nullable<{ id: string; nodes: PoolXYKEntity[] }>> {
    try {
      const params = {
        filter: chartsPoolXykEntityFilter(poolXykEntityId, assetId),
      };

      const { poolXYKEntities } = await this.request(ChartsFiatPriceQuery, params);

      if (!poolXYKEntities) return null;

      const { id, nodes } = poolXYKEntities.nodes;

      return { id, nodes };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get fiat price for charts
   */
  public async getChartsHistoryPrices(assetId?: string): Promise<Nullable<FiatPriceAndApyObject>> {
    const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

    const acc: FiatPriceAndApyObject = {};

    let poolXykEntityId = '';

    try {
      const response = await this.fetchChartsPrice(poolXykEntityId, assetId);

      if (!response) {
        return poolXykEntityId ? acc : null;
      }

      poolXykEntityId = response.id;

      response.nodes.forEach((el: PoolXYKEntity) => {
        const strategicBonusApyFPNumber = format(el.strategicBonusApy);
        const priceFPNumber = format(el.priceUSD);
        const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
        const isPriceFinity = priceFPNumber.isFinity();
        if (isPriceFinity || isStrategicBonusApyFinity) {
          acc[el.targetAssetId] = {};
        }
        if (isPriceFinity) {
          acc[el.targetAssetId].price = priceFPNumber.toCodecString();
        }
        if (isStrategicBonusApyFinity) {
          acc[el.targetAssetId].strategicBonusApy = strategicBonusApyFPNumber.toCodecString();
        }
      });

      return acc;
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * This method should be used **only** for total redeemed value for Noir Exchange
   * @param accountId Noir Account Id
   * @param noirAssetId Noir Asset Id
   */
  public async getNoirTotalRedeemed(accountId?: string, noirAssetId?: string): Promise<number> {
    try {
      const variables = {
        filter: noirHistoryElementsFilter(accountId, noirAssetId),
      };
      const { historyElements } = await this.request(HistoryElementsQuery, variables);
      const count = (historyElements.edges as Array<any>).reduce((value, item) => {
        return value + +item.node.data.amount;
      }, 0);
      return ~~count;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  /**
   * Get Referral Rewards summarized by referral
   */
  public async getAccountReferralRewards(referrer?: string): Promise<Nullable<ReferrerRewards>> {
    const rewardsInfo: ReferrerRewards = {
      rewards: FPNumber.ZERO,
      invitedUserRewards: {},
    };

    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.getAccountRewards(referrer, after);

        if (!response) {
          return null;
        }

        after = response.endCursor;
        hasNextPage = response.hasNextPage;

        response.nodes.forEach((item) => {
          rewardsInfo.rewards = rewardsInfo.rewards.add(new FPNumber(item.amount));
          const invitedUser = item.referral;
          if (!rewardsInfo.invitedUserRewards[invitedUser]) {
            rewardsInfo.invitedUserRewards[invitedUser] = { rewards: FPNumber.ZERO };
          }
          rewardsInfo.invitedUserRewards[invitedUser].rewards = rewardsInfo.invitedUserRewards[invitedUser].rewards.add(
            new FPNumber(item.amount)
          );
        });
      } while (hasNextPage);

      return rewardsInfo;
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Get Referral Rewards items
   */
  public async getAccountRewards(
    referrer?: string,
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: ReferrerReward[] }>> {
    try {
      const params = {
        after,
        filter: referrerRewardsFilter(referrer),
      };

      const { referrerRewards } = await this.request(ReferrerRewardsQuery, params);

      if (!referrerRewards) return null;

      const {
        pageInfo: { hasNextPage, endCursor },
        nodes,
      } = referrerRewards;

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async request(query: any, variables = {}): Promise<any> {
    const url = SubqueryExplorer.getApiUrl(this.soraNetwork);
    const response = await axiosInstance.post(url, {
      query,
      variables,
    });
    return response.data.data;
  }
}
