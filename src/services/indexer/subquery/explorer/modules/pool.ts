import { formatStringNumber } from '../../../../../util';
import { ApyQuery } from '../../queries/fiatPriceAndApy';
import { PoolsApySubscription } from '../../subscriptions/fiatPriceAndApy';

import { SubqueryBaseModule } from './_base';

import type { SubqueryPoolXYKEntity, SubqueryStreamUpdate, PoolApyObject } from '../../types';

function parseApy(entity: SubqueryPoolXYKEntity): PoolApyObject {
  const acc = {};
  const id = entity.id;
  const strategicBonusApyFPNumber = formatStringNumber(entity.strategicBonusApy);
  const isStrategicBonusApyFinity = strategicBonusApyFPNumber.isFinity();
  if (isStrategicBonusApyFinity) {
    acc[id] = strategicBonusApyFPNumber.toCodecString();
  }
  return acc;
}

function parseStreamUpdate(entity: SubqueryStreamUpdate): PoolApyObject {
  return entity && entity.data ? JSON.parse(entity.data) : {};
}

export class SubqueryPoolModule extends SubqueryBaseModule {
  /**
   * Get strategic bonus APY for each pool
   */
  public async getPoolsApyObject(): Promise<Nullable<PoolApyObject>> {
    const result = await this.root.fetchAllEntities(ApyQuery, {}, parseApy);

    if (!result) return null;

    return result.reduce((acc, item) => ({ ...acc, ...item }), {});
  }

  public createPoolsApySubscription(handler: (entity: PoolApyObject) => void, errorHandler: () => void): VoidFunction {
    return this.root.createEntitySubscription(PoolsApySubscription, {}, parseStreamUpdate, handler, errorHandler);
  }
}
