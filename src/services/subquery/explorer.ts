import { axiosInstance, FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsQuery } from './queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from './queries/referrerRewards';
import { HistoricalPriceQuery, historicalPriceFilter } from './queries/historicalPrice';
import { FiatPriceQuery } from './queries/fiatPriceAndApy';
import { SoraNetwork } from '../../consts';
import { AssetSnapshotTypes } from './types';
import store from '../../store';

import type {
  Explorer,
  PoolXYKEntity,
  FiatPriceAndApyObject,
  ReferrerRewards,
  ReferralRewardsGroup,
  AssetSnapshot,
} from './types';

export default class SubqueryExplorer implements Explorer {
  public get soraNetwork(): Nullable<SoraNetwork> {
    return store.state.wallet.settings.soraNetwork;
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
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: PoolXYKEntity[] }>> {
    try {
      const params = { after };

      const { poolXYKs } = await this.request(FiatPriceQuery, params);

      if (!poolXYKs) return null;

      const {
        pageInfo: { hasNextPage, endCursor },
        nodes,
      } = poolXYKs;

      return { hasNextPage, endCursor, nodes };
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

    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchPools(after);

        if (!response) {
          return Object.keys(acc).length ? acc : null;
        }

        after = response.endCursor;
        hasNextPage = response.hasNextPage;

        response.nodes.forEach((el: PoolXYKEntity) => {
          const strategicBonusApyFPNumber = format(el.strategicBonusApy);
          const priceFPNumber = format(el.priceUSD);
          const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
          const isPriceFinity = priceFPNumber.isFinity();
          if (isPriceFinity || isStrategicBonusApyFinity) {
            acc[el.id] = {};
          }
          if (isPriceFinity) {
            acc[el.id].price = priceFPNumber.toCodecString();
          }
          if (isStrategicBonusApyFinity) {
            acc[el.id].strategicBonusApy = strategicBonusApyFPNumber.toCodecString();
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
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = AssetSnapshotTypes.DEFAULT,
    first = null
  ): Promise<Nullable<AssetSnapshot[]>> {
    const filter = historicalPriceFilter(assetId, type);

    try {
      const { assetSnapshots } = await this.request(HistoricalPriceQuery, { filter, first });

      if (!assetSnapshots) {
        return null;
      }

      const { nodes } = assetSnapshots;

      if (!nodes || !nodes.length) {
        return null;
      }

      return nodes;
    } catch (error) {
      console.error('HistoricalPriceQuery: Subquery is not available or data is incorrect!', error);
      return null;
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
    const url = store.state.wallet.settings.subqueryEndpoint;
    if (!url) {
      throw new Error('Subquery endpoint is not set');
    }
    const response = await axiosInstance.post(url, {
      query,
      variables,
    });
    return response.data.data;
  }
}
