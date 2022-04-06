import { axiosInstance, FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsQuery, noirHistoryElementsFilter } from './queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from './queries/referrerRewards';
import { HistoricalPriceQuery } from './queries/historicalPrice';
import { FiatPriceQuery, poolXykEntityFilter } from './queries/fiatPriceAndApy';
import { SoraNetwork } from '../../consts';
import store from '../../store';
import type {
  Explorer,
  PoolXYKEntity,
  FiatPriceAndApyObject,
  ReferrerRewards,
  ReferralRewardsGroup,
  HistoricalPrice,
} from './types';

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
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param first number of timestamp entities (10 by default)
   */
  public async getHistoricalPriceForAsset(assetId: string, first = 10): Promise<Nullable<HistoricalPrice>> {
    const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

    try {
      const { poolXYKEntities } = await this.request(HistoricalPriceQuery, { assetId, first });
      if (!poolXYKEntities) {
        return null;
      }
      const { nodes } = poolXYKEntities;
      if (!nodes || !nodes.length) {
        return null;
      }
      const data = (nodes as Array<any>).reduce<HistoricalPrice>((acc, el) => {
        const item: { updated: number; priceUSD: string } = el.pools.nodes[0];
        if (item) {
          const priceFPNumber = format(item.priceUSD);
          const isPriceFinity = priceFPNumber.isFinity();
          if (isPriceFinity) {
            acc[item.updated * 1000] = priceFPNumber.toCodecString();
          }
        }
        return acc;
      }, {});

      return data;
    } catch (error) {
      console.error('HistoricalPriceQuery: Subquery is not available or data is incorrect!', error);
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

    try {
      const groups = await this.getAccountRewards(referrer);

      if (!groups) return null;

      groups.forEach((group) => {
        const referral = group.keys[0];
        const amount = FPNumber.fromCodecValue(group.sum.amount, XOR.decimals);

        rewardsInfo.rewards = rewardsInfo.rewards.add(amount);

        if (!rewardsInfo.invitedUserRewards[referral]) {
          rewardsInfo.invitedUserRewards[referral] = { rewards: FPNumber.ZERO };
        }

        rewardsInfo.invitedUserRewards[referral].rewards = rewardsInfo.invitedUserRewards[referral].rewards.add(amount);
      });

      return rewardsInfo;
    } catch (error) {
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Get Referral Rewards items grouped by referral
   */
  public async getAccountRewards(referrer?: string): Promise<Nullable<ReferralRewardsGroup[]>> {
    try {
      const variables = {
        filter: referrerRewardsFilter(referrer),
      };

      const {
        referrerRewards: { groupedAggregates },
      } = await this.request(ReferrerRewardsQuery, variables);

      return groupedAggregates;
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
