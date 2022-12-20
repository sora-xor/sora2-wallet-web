import { FPNumber } from '@sora-substrate/math';

import { FiatPriceQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';

import { FiatPriceSubscription } from '../../subscriptions/fiatPriceAndApy';

import { AssetSnapshotTypes } from '../../types';

import type SubqueryExplorer from '../index';
import type { AssetEntity, AssetSnapshot, FiatPriceObject } from '../../types';

const format = (value: Nullable<string>) => (value ? new FPNumber(value) : FPNumber.ZERO);

export class PriceModule {
  private readonly root!: SubqueryExplorer;

  constructor(root: SubqueryExplorer) {
    this.root = root;
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

  private async fetchFiatPrices(
    after?: string
  ): Promise<Nullable<{ hasNextPage: boolean; endCursor: string; nodes: AssetEntity[] }>> {
    try {
      const params = { after };

      const response = await this.root.request(FiatPriceQuery, params);

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

  /**
   * Get fiat price for each asset
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

  public createFiatPriceSubscription(
    handler: (entity: FiatPriceObject) => void,
    errorHandler: () => void
  ): VoidFunction {
    const createSubscription = this.root.subscribe(FiatPriceSubscription, {});

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
      const { assetSnapshots } = await this.root.request(HistoricalPriceQuery, { filter, first, after });

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
}
