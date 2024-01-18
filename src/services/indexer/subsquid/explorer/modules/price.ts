import { parseAssetFiatPrice, parsePriceStreamUpdate } from '../../../explorer/utils';
import { FiatPriceQuery, FiatPriceStreamQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { PriceStreamSubscription } from '../../subscriptions/fiatPriceAndApy';
import { AssetSnapshotEntity, ConnectionQueryResponseData, SnapshotTypes } from '../../types';

import { BaseModule } from './_base';

import type { FiatPriceObject } from '../../types';

export class SubsquidPriceModule extends BaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntitiesConnection(FiatPriceQuery, {}, parseAssetFiatPrice);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public async getFiatPriceUpdates(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.request(FiatPriceStreamQuery);

    if (!result) return null;

    const updates = parsePriceStreamUpdate(result.data);

    return updates;
  }

  public createFiatPriceSubscription(
    handler: (entity: Nullable<FiatPriceObject>) => void,
    errorHandler: () => void
  ): VoidFunction {
    return this.root.createEntitySubscription(
      PriceStreamSubscription,
      {},
      parsePriceStreamUpdate,
      handler,
      errorHandler
    );
  }

  /**
   * Get historical data for selected asset
   * @param assetId Asset ID
   * @param type type of snapshots
   * @param first number entities (all by default)
   */
  public async getHistoricalPriceForAsset(
    assetId: string,
    type = SnapshotTypes.DEFAULT,
    first?: number,
    after?: string | null
  ): Promise<Nullable<ConnectionQueryResponseData<AssetSnapshotEntity>>> {
    if (after === '') {
      after = null;
    }

    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const data = await this.root.fetchEntitiesConnection(HistoricalPriceQuery, variables);

    if (data) {
      return {
        ...data,
        edges: data.edges.map((edge) => {
          return {
            ...edge,
            node: {
              ...edge.node,
              assetId: edge.node.asset.id,
            },
          };
        }),
      };
    }

    return data;
  }
}
