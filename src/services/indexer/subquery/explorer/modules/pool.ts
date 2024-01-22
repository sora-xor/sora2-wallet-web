import { parseApy, parseApyStreamUpdate } from '../../../explorer/utils';
import { ApyQuery } from '../../queries/fiatPriceAndApy';
import { ApyStreamSubscription } from '../../subscriptions/stream';

import { SubqueryBaseModule } from './_base';

import type { PoolApyObject } from '../../types';

export class SubqueryPoolModule extends SubqueryBaseModule {
  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.root.fetchAllEntities(ApyQuery, {}, parseApy);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createPoolsApySubscription(
    handler: (entity: PoolApyObject) => void,
    errorHandler: (error: any) => void
  ): VoidFunction {
    return this.root.createEntitySubscription(ApyStreamSubscription, {}, parseApyStreamUpdate, handler, errorHandler);
  }
}
