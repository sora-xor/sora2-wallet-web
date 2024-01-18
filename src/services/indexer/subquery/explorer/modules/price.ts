import { formatStringNumber } from '../../../../../util';
import { parseAssetFiatPrice, parsePriceStreamUpdate } from '../../../explorer/utils';
import { FiatPriceQuery, FiatPriceStreamQuery } from '../../queries/fiatPriceAndApy';
import { HistoricalPriceQuery, historicalPriceFilter } from '../../queries/historicalPrice';
import { FiatAssetsPriceSubscription, PriceStreamSubscription } from '../../subscriptions/fiatPriceAndApy';
import { AssetSnapshotEntity, ConnectionQueryResponseData, SnapshotTypes } from '../../types';

import { SubqueryBaseModule } from './_base';

import type { SubqueryAssetEntityMutation, FiatPriceObject } from '../../types';

// [TODO] remove after prod-sub4 deprecation
function parseFiatPriceUpdate(entity: SubqueryAssetEntityMutation): FiatPriceObject {
  const acc = {};
  const id = entity.id;
  const priceFPNumber = formatStringNumber(entity.price_u_s_d);
  const isPriceFinity = priceFPNumber.isFinity();
  if (isPriceFinity) {
    acc[id] = priceFPNumber.toCodecString();
  }
  return acc;
}

export class SubqueryPriceModule extends SubqueryBaseModule {
  /**
   * Get fiat price for each asset
   */
  public async getFiatPriceObject(): Promise<Nullable<FiatPriceObject>> {
    const result = await this.root.fetchAllEntities(FiatPriceQuery, {}, parseAssetFiatPrice);

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
    let subscription!: VoidFunction;

    subscription = this.root.createEntitySubscription(
      PriceStreamSubscription,
      {},
      parsePriceStreamUpdate,
      handler,
      // [TODO] remove after prod-sub4 deprecation
      () => {
        subscription = this.root.createEntitySubscription(
          FiatAssetsPriceSubscription,
          {},
          parseFiatPriceUpdate,
          handler,
          errorHandler
        );
      }
    );

    return subscription;
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
    after?: string
  ): Promise<Nullable<ConnectionQueryResponseData<AssetSnapshotEntity>>> {
    const filter = historicalPriceFilter(assetId, type);
    const variables = { filter, first, after };
    const data = await this.root.fetchEntities(HistoricalPriceQuery, variables);

    return data;
  }
}
