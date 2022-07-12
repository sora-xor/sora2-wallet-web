import { FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsQuery } from './queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from './queries/referrerRewards';
import { HistoricalPriceQuery, historicalPriceFilter } from './queries/historicalPrice';
import { FiatPriceQuery } from './queries/fiatPriceAndApy';
import { SoraNetwork } from '../../consts';
import { AssetSnapshotTypes } from './types';

import { createSubqueryClient } from './client';
import type { Client } from './client';

import store from '../../store';

import type {
  Explorer,
  PoolXYKEntity,
  FiatPriceAndApyObject,
  ReferrerRewards,
  AccountReferralReward,
  AssetSnapshot,
} from './types';

export default class SubqueryExplorer implements Explorer {
  public client!: Client;

  public get soraNetwork(): Nullable<SoraNetwork> {
    return store.state.wallet.settings.soraNetwork;
  }

  public initClient() {
    if (this.client) return;

    const url = store.state.wallet.settings.subqueryEndpoint;

    if (!url) {
      throw new Error('Subquery endpoint is not set');
    }

    this.client = createSubqueryClient(url);
  }

  public async getAccountTransactions(variables = {}): Promise<any> {
    const { historyElements } = await this.request(HistoryElementsQuery, variables);

    return historyElements;
  }

  /**
   * Fetch pools from poolXYKs
   * @param after cursor of last element
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
    first?: number,
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: AssetSnapshot[] }>> {
    const filter = historicalPriceFilter(assetId, type);

    try {
      const { assetSnapshots } = await this.request(HistoricalPriceQuery, { filter, first, after });

      if (!assetSnapshots) {
        return null;
      }

      const {
        nodes,
        pageInfo: { hasNextPage, endCursor },
      } = assetSnapshots;

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      console.error('HistoricalPriceQuery: Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Get Referral Rewards summarized by referral
   */
  public async getAccountReferralRewards(referrer: string): Promise<Nullable<ReferrerRewards>> {
    const rewardsInfo: ReferrerRewards = {
      rewards: FPNumber.ZERO,
      invitedUserRewards: {},
    };

    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.getAccountRewards(referrer, after);

        if (!response) return null;

        after = response.endCursor;
        hasNextPage = response.hasNextPage;

        response.nodes.forEach((node) => {
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
      console.error('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Get Referral Rewards items by referral
   */
  public async getAccountRewards(
    referrer: string,
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: AccountReferralReward[] }>> {
    try {
      const variables = {
        after,
        filter: referrerRewardsFilter(referrer),
      };

      const {
        referrerRewards: {
          nodes,
          pageInfo: { hasNextPage, endCursor },
        },
      } = await this.request(ReferrerRewardsQuery, variables);

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async request(query, variables = {}): Promise<any> {
    this.initClient();

    const { data } = await this.client.query(query, variables).toPromise();

    return data;
  }
}
