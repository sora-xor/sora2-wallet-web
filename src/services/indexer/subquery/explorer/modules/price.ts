import { parseAssetFiatPrice, parsePriceStreamUpdate } from '../../../explorer/utils';
import { FiatPriceQuery, FiatPriceStreamQuery } from '../../queries/fiatPriceAndApy';
import { PriceStreamSubscription } from '../../subscriptions/stream';

import { SubqueryBaseModule } from './_base';

import type { FiatPriceObject } from '../../types';

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

    return parsePriceStreamUpdate(result.data);
  }

  public createFiatPriceSubscription(
    handler: (entity: Nullable<FiatPriceObject>) => void,
    errorHandler: () => void | Promise<void>
  ): VoidFunction {
    return this.root.createEntitySubscription(
      PriceStreamSubscription,
      {},
      parsePriceStreamUpdate,
      handler,
      errorHandler
    );
  }
}
