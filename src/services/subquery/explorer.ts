import { pipe, subscribe } from 'wonka';
import { FPNumber } from '@sora-substrate/util';
import { XOR } from '@sora-substrate/util/build/assets/consts';

import { HistoryElementsQuery } from './queries/historyElements';
import { ReferrerRewardsQuery, referrerRewardsFilter } from './queries/referrerRewards';
import { HistoricalPriceQuery, historicalPriceFilter } from './queries/historicalPrice';
import { FiatPriceQuery, ApyQuery } from './queries/fiatPriceAndApy';
import { FiatPriceSubscription } from './subscriptions/fiatPriceAndApy';
import { AccountHistorySubscription } from './subscriptions/account';
import { SoraNetwork } from '../../consts';
import { AssetSnapshotTypes, PoolApyObject } from './types';

import { createSubqueryClient } from './client';

import type { Client, OperationResult, ResultOf, TypedDocumentNode } from './client';

import store from '../../store';

import type {
  Explorer,
  AssetEntity,
  PoolXYKEntity,
  FiatPriceObject,
  ReferrerRewards,
  AccountReferralReward,
  AssetSnapshot,
  HistoryElement,
  HistoryElementsQueryResponse,
} from './types';

const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

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

    this.client = createSubqueryClient(url, true);
  }

  public async getAccountTransactions(variables = {}): Promise<Nullable<HistoryElementsQueryResponse>> {
    const { historyElements } = await this.request(HistoryElementsQuery, variables);

    return historyElements as HistoryElementsQueryResponse;
  }

  /**
   * Fetch apy from poolXYKs
   * @param after cursor of last element
   */
  public async fetchPoolsApy(
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: PoolXYKEntity[] }>> {
    try {
      const params = { after };

      const response = await this.request(ApyQuery, params);

      if (!response || !response.poolXYKs) return null;

      const {
        pageInfo: { hasNextPage, endCursor },
        nodes,
      } = response.poolXYKs;

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      return null;
    }
  }

  public async fetchFiatPrices(
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: AssetEntity[] }>> {
    try {
      const params = { after };

      const response = await this.request(FiatPriceQuery, params);

      if (!response || !response.assets) return null;

      const {
        pageInfo: { hasNextPage, endCursor },
        nodes,
      } = response.assets;

      return { hasNextPage, endCursor, nodes };
    } catch (error) {
      return null;
    }
  }

  public createAccountHistorySubscription(accountAddress: string, handler: (entity: HistoryElement) => void) {
    const variables = { id: [accountAddress] };
    const createSubscription = this.subscribe(AccountHistorySubscription, variables);

    return createSubscription(async (payload) => {
      if (payload.data) {
        const txId = payload.data.accounts._entity.latest_history_element_id;
        const variables = { filter: { id: { equalTo: txId } } };
        const response = await this.getAccountTransactions(variables);

        if (response && Array.isArray(response.edges) && response.edges[0]) {
          handler(response.edges[0].node);
        }
      }
    });
  }

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const createSubscription = this.subscribe(FiatPriceSubscription, {});

    return createSubscription((payload) => {
      try {
        if (payload.data) {
          const entity = this.parseFiatPrice(payload.data.assets._entity);
          handler(entity);
        } else {
          errorHandler();
        }
      } catch (error) {
        errorHandler();
      }
    });
  }

  public parseFiatPrice(entity: AssetEntity): FiatPriceObject {
    const acc = {};
    const id = entity.id;
    const priceFPNumber = format(entity.priceUSD || entity.price_u_s_d);
    const isPriceFinity = priceFPNumber.isFinity();
    if (isPriceFinity) {
      acc[id] = priceFPNumber.toCodecString();
    }
    return acc;
  }

  public parseApy(entity: PoolXYKEntity): PoolApyObject {
    const acc = {};
    const id = entity.id;
    const strategicBonusApyFPNumber = format(entity.strategicBonusApy || entity.strategic_bonus_apy);
    const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
    if (isStrategicBonusApyFinity) {
      acc[id] = strategicBonusApyFPNumber.toCodecString();
    }
    return acc;
  }

  /**
   * Get fiat price & APY coefficient for each asset (without historical data)
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    let acc: FiatPriceObject = {};
    let after = '';
    let hasNextPage = true;

    try {
      do {
        const response = await this.fetchFiatPrices(after);

        if (!response) {
          return Object.keys(acc).length ? acc : null;
        }

        after = response.endCursor;
        hasNextPage = response.hasNextPage;

        response.nodes.forEach((el: AssetEntity) => {
          const record = this.parseFiatPrice(el);

          acc = { ...acc, ...record };
        });
      } while (hasNextPage);

      return acc;
    } catch (error) {
      console.warn('Subquery is not available or data is incorrect!', error);
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
      console.warn('HistoricalPriceQuery: Subquery is not available or data is incorrect!', error);
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
      console.warn('Subquery is not available or data is incorrect!', error);
      return null;
    }
  }

  /**
   * Get Referral Rewards items by referral
   */
  private async getAccountRewards(
    referrer: string,
    after?: string
  ): Promise<{ hasNextPage: boolean; endCursor: string; nodes: AccountReferralReward[] }> {
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
  }

  public async request<T>(query: TypedDocumentNode<T>, variables = {}) {
    this.initClient();

    const { data } = await this.client.query<ResultOf<typeof query>>(query, variables).toPromise();

    return data;
  }

  // https://formidable.com/open-source/urql/docs/advanced/subscriptions/#one-off-subscriptions
  public subscribe<T>(subscription: TypedDocumentNode<T>, variables = {}) {
    this.initClient();

    return (handler: (payload: OperationResult<T, any>) => void) => {
      const { unsubscribe } = pipe(
        this.client.subscription<ResultOf<typeof subscription>>(subscription, variables),
        subscribe((payload) => handler(payload))
      );

      return unsubscribe;
    };
  }
}
